import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Lazy load notifications to handle missing native module
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let notificationsAvailable = false;

// Try to load notifications module (will fail if native module not built)
try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  notificationsAvailable = true;
  
  // Configure notification behavior only if available
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('expo-notifications not available - notifications disabled');
  notificationsAvailable = false;
}

export interface SessionReminder {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  days: number[]; // 1-7 (Sunday-Saturday)
  enabled: boolean;
  frequencyId?: string;
  bathId?: string;
  notificationIds: string[]; // Scheduled notification identifiers
}

interface RemindersState {
  reminders: SessionReminder[];
  permissionGranted: boolean;
  notificationsAvailable: boolean;
  
  // Actions
  requestPermissions: () => Promise<boolean>;
  addReminder: (reminder: Omit<SessionReminder, 'id' | 'notificationIds'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<SessionReminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  scheduleReminder: (reminder: SessionReminder) => Promise<string[]>;
  cancelReminder: (notificationIds: string[]) => Promise<void>;
  rescheduleAllReminders: () => Promise<void>;
}

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set, get) => ({
      reminders: [],
      permissionGranted: false,
      notificationsAvailable,
      
      requestPermissions: async () => {
        if (!notificationsAvailable || !Notifications || !Device) {
          Alert.alert(
            'Notifications Not Available',
            'Push notifications require a native app rebuild. Reminders will be saved but won\'t send notifications until you rebuild the app.'
          );
          return false;
        }
        
        if (!Device.isDevice) {
          Alert.alert('Notifications', 'Push notifications require a physical device.');
          return false;
        }
        
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive session reminders.'
          );
          set({ permissionGranted: false });
          return false;
        }
        
        // Android requires notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('session-reminders', {
            name: 'Session Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#a855f7',
            sound: 'default',
          });
        }
        
        set({ permissionGranted: true });
        return true;
      },
      
      scheduleReminder: async (reminder: SessionReminder) => {
        if (!notificationsAvailable || !Notifications) {
          return []; // Return empty array if notifications not available
        }
        
        const notificationIds: string[] = [];
        
        for (const day of reminder.days) {
          const trigger: any = {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day,
            hour: reminder.hour,
            minute: reminder.minute,
          };
          
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: reminder.title,
              body: reminder.body,
              sound: 'default',
              data: {
                reminderId: reminder.id,
                frequencyId: reminder.frequencyId,
                bathId: reminder.bathId,
              },
            },
            trigger,
          });
          
          notificationIds.push(notificationId);
        }
        
        return notificationIds;
      },
      
      cancelReminder: async (notificationIds: string[]) => {
        if (!notificationsAvailable || !Notifications) return;
        
        for (const id of notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      },
      
      addReminder: async (reminderData) => {
        const { permissionGranted, scheduleReminder } = get();
        
        // Allow adding reminders even without notifications (they'll be stored)
        if (!permissionGranted && notificationsAvailable) {
          const granted = await get().requestPermissions();
          // Continue even if not granted - reminder will be saved
        }
        
        const newReminder: SessionReminder = {
          ...reminderData,
          id: `reminder_${Date.now()}`,
          notificationIds: [],
        };
        
        // Schedule if enabled
        if (newReminder.enabled) {
          newReminder.notificationIds = await scheduleReminder(newReminder);
        }
        
        set((state) => ({
          reminders: [...state.reminders, newReminder]
        }));
      },
      
      updateReminder: async (id, updates) => {
        const { reminders, scheduleReminder, cancelReminder } = get();
        const reminder = reminders.find(r => r.id === id);
        
        if (!reminder) return;
        
        // Cancel existing notifications
        if (reminder.notificationIds.length > 0) {
          await cancelReminder(reminder.notificationIds);
        }
        
        const updatedReminder = { ...reminder, ...updates, notificationIds: [] };
        
        // Reschedule if enabled
        if (updatedReminder.enabled) {
          updatedReminder.notificationIds = await scheduleReminder(updatedReminder);
        }
        
        set((state) => ({
          reminders: state.reminders.map(r => 
            r.id === id ? updatedReminder : r
          )
        }));
      },
      
      deleteReminder: async (id) => {
        const { reminders, cancelReminder } = get();
        const reminder = reminders.find(r => r.id === id);
        
        if (reminder && reminder.notificationIds.length > 0) {
          await cancelReminder(reminder.notificationIds);
        }
        
        set((state) => ({
          reminders: state.reminders.filter(r => r.id !== id)
        }));
      },
      
      toggleReminder: async (id) => {
        const { reminders, scheduleReminder, cancelReminder, requestPermissions, permissionGranted } = get();
        const reminder = reminders.find(r => r.id === id);
        
        if (!reminder) return;
        
        const newEnabled = !reminder.enabled;
        
        if (newEnabled && !permissionGranted) {
          const granted = await requestPermissions();
          if (!granted) return;
        }
        
        // Cancel existing
        if (reminder.notificationIds.length > 0) {
          await cancelReminder(reminder.notificationIds);
        }
        
        let newNotificationIds: string[] = [];
        
        // Schedule if enabling
        if (newEnabled) {
          newNotificationIds = await scheduleReminder(reminder);
        }
        
        set((state) => ({
          reminders: state.reminders.map(r => 
            r.id === id 
              ? { ...r, enabled: newEnabled, notificationIds: newNotificationIds }
              : r
          )
        }));
      },
      
      rescheduleAllReminders: async () => {
        const { reminders, scheduleReminder, cancelReminder } = get();
        
        // Cancel all existing
        for (const reminder of reminders) {
          if (reminder.notificationIds.length > 0) {
            await cancelReminder(reminder.notificationIds);
          }
        }
        
        // Reschedule enabled reminders
        const updatedReminders = await Promise.all(
          reminders.map(async (reminder) => {
            if (reminder.enabled) {
              const notificationIds = await scheduleReminder(reminder);
              return { ...reminder, notificationIds };
            }
            return { ...reminder, notificationIds: [] };
          })
        );
        
        set({ reminders: updatedReminders });
      }
    }),
    {
      name: 'healtone-reminders',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

// Preset reminder templates
export const REMINDER_PRESETS = [
  {
    title: '🌅 Morning Awakening',
    body: 'Time for your morning frequency session. Start your day with healing vibrations!',
    defaultHour: 7,
    defaultMinute: 0,
    suggestedFrequency: 528, // Love frequency
  },
  {
    title: '🧠 Focus Time',
    body: 'Ready for deep work? A focus frequency bath can boost your concentration.',
    defaultHour: 9,
    defaultMinute: 30,
    suggestedFrequency: 40, // Gamma
  },
  {
    title: '🌆 Evening Wind Down',
    body: 'Time to release the day\'s stress. Your calming session awaits.',
    defaultHour: 18,
    defaultMinute: 0,
    suggestedFrequency: 639, // Harmony
  },
  {
    title: '🌙 Sleep Preparation',
    body: 'Prepare your mind and body for restorative sleep with deep frequencies.',
    defaultHour: 21,
    defaultMinute: 30,
    suggestedFrequency: 174, // Foundation/Pain relief
  },
  {
    title: '✨ Manifestation Practice',
    body: 'Time for your manifestation session. Connect with your intentions.',
    defaultHour: 6,
    defaultMinute: 0,
    suggestedFrequency: 963, // Crown/Divine
  }
];

// Helper to format time
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

// Helper to format days
export function formatDays(days: number[]): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes(1) && !days.includes(7)) return 'Weekdays';
  if (days.length === 2 && days.includes(1) && days.includes(7)) return 'Weekends';
  return days.map(d => dayNames[d - 1]).join(', ');
}
