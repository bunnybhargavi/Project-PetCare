package com.pets.petcare.dto;

/**
 * Request DTO for updating notification preferences
 */
public class NotificationPreferenceRequest {
    
    // Email notification preferences
    private Boolean emailBookingConfirmation;
    private Boolean email24HourReminder;
    private Boolean email1HourReminder;
    private Boolean emailDailyScheduleDigest;
    private Boolean emailNewBookingAlert;
    private Boolean emailCancellationNotice;

    // SMS notification preferences
    private Boolean smsBookingConfirmation;
    private Boolean sms24HourReminder;
    private Boolean sms1HourReminder;

    // Push notification preferences
    private Boolean pushBookingConfirmation;
    private Boolean pushReminders;

    // Default constructor
    public NotificationPreferenceRequest() {}

    // Getters and Setters
    public Boolean getEmailBookingConfirmation() {
        return emailBookingConfirmation;
    }

    public void setEmailBookingConfirmation(Boolean emailBookingConfirmation) {
        this.emailBookingConfirmation = emailBookingConfirmation;
    }

    public Boolean getEmail24HourReminder() {
        return email24HourReminder;
    }

    public void setEmail24HourReminder(Boolean email24HourReminder) {
        this.email24HourReminder = email24HourReminder;
    }

    public Boolean getEmail1HourReminder() {
        return email1HourReminder;
    }

    public void setEmail1HourReminder(Boolean email1HourReminder) {
        this.email1HourReminder = email1HourReminder;
    }

    public Boolean getEmailDailyScheduleDigest() {
        return emailDailyScheduleDigest;
    }

    public void setEmailDailyScheduleDigest(Boolean emailDailyScheduleDigest) {
        this.emailDailyScheduleDigest = emailDailyScheduleDigest;
    }

    public Boolean getEmailNewBookingAlert() {
        return emailNewBookingAlert;
    }

    public void setEmailNewBookingAlert(Boolean emailNewBookingAlert) {
        this.emailNewBookingAlert = emailNewBookingAlert;
    }

    public Boolean getEmailCancellationNotice() {
        return emailCancellationNotice;
    }

    public void setEmailCancellationNotice(Boolean emailCancellationNotice) {
        this.emailCancellationNotice = emailCancellationNotice;
    }

    public Boolean getSmsBookingConfirmation() {
        return smsBookingConfirmation;
    }

    public void setSmsBookingConfirmation(Boolean smsBookingConfirmation) {
        this.smsBookingConfirmation = smsBookingConfirmation;
    }

    public Boolean getSms24HourReminder() {
        return sms24HourReminder;
    }

    public void setSms24HourReminder(Boolean sms24HourReminder) {
        this.sms24HourReminder = sms24HourReminder;
    }

    public Boolean getSms1HourReminder() {
        return sms1HourReminder;
    }

    public void setSms1HourReminder(Boolean sms1HourReminder) {
        this.sms1HourReminder = sms1HourReminder;
    }

    public Boolean getPushBookingConfirmation() {
        return pushBookingConfirmation;
    }

    public void setPushBookingConfirmation(Boolean pushBookingConfirmation) {
        this.pushBookingConfirmation = pushBookingConfirmation;
    }

    public Boolean getPushReminders() {
        return pushReminders;
    }

    public void setPushReminders(Boolean pushReminders) {
        this.pushReminders = pushReminders;
    }
}