import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const notificationService = {
    requestPermissions: async () => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const permission = await LocalNotifications.checkPermissions();
            if (permission.display !== 'granted') {
                const request = await LocalNotifications.requestPermissions();
                return request.display === 'granted';
            }
            return true;
        } catch (error) {
            console.error('Error checking/requesting notification permissions:', error);
            return false;
        }
    },

    scheduleRaffleReminder: async (raffle) => {
        if (!Capacitor.isNativePlatform() || !raffle.drawDate) return;

        try {
            // 1. Calculate notification time: 1 day before drawDate at 12:00 PM
            const drawDate = new Date(raffle.drawDate + 'T12:00:00');
            const notificationDate = new Date(drawDate.getTime());
            notificationDate.setDate(notificationDate.getDate() - 1);
            notificationDate.setHours(12, 0, 0, 0);

            // 2. Check if notification date is in the future
            if (notificationDate.getTime() <= Date.now()) {
                console.log('Notification date is in the past, skipping scheduling');
                return;
            }

            // 3. Generate a numeric ID for the notification based on raffle ID string
            // Using a simple hash for string to int
            const charArray = raffle.id.split('');
            const notificationId = charArray.reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2147483647;

            // 4. Cancel existing notification for this raffle if any
            await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });

            // 5. Schedule new notification
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Recordatorio de Sorteo',
                        body: `Recuerda que mañana tienes un sorteo de una de tus rifas: ${raffle.title}`,
                        id: notificationId,
                        schedule: { at: notificationDate },
                        sound: null,
                        attachments: null,
                        actionTypeId: '',
                        extra: null,
                    }
                ]
            });

            console.log(`Notification scheduled for raffle ${raffle.id} at ${notificationDate}`);
        } catch (error) {
            console.error('Error scheduling raffle reminder:', error);
        }
    },

    cancelRaffleReminder: async (raffleId) => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const charArray = raffleId.split('');
            const notificationId = charArray.reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2147483647;
            await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
            console.log(`Notification cancelled for raffle ${raffleId}`);
        } catch (error) {
            console.error('Error cancelling raffle reminder:', error);
        }
    }
};
