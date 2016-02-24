package org.bigbluebutton.core

import org.bigbluebutton.core.models.Permissions
import java.util.concurrent.TimeUnit

case object StopMeetingActor
case class MeetingProperties(meetingID: String, externalMeetingID: String, meetingName: String, recorded: Boolean,
  voiceBridge: String, duration: Int, autoStartRecording: Boolean, allowStartStopRecording: Boolean,
  moderatorPass: String, viewerPass: String, createTime: Long, createDate: String, isBreakout: Boolean)

case class MeetingExtensionProp(maxExtensions: Int = 2, numExtensions: Int = 0, extendByMinutes: Int = 20,
  sendNotice: Boolean = true, sent15MinNotice: Boolean = false,
  sent10MinNotice: Boolean = false, sent5MinNotice: Boolean = false)

class MeetingModel {
  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissions = new Permissions()
  private var recording = false;
  private var muted = false;
  private var meetingEnded = false
  private var meetingMuted = false

  val TIMER_INTERVAL = 30000
  private var hasLastWebUserLeft = false
  private var lastWebUserLeftOnTimestamp: Long = 0

  private var voiceRecordingFilename: String = ""

  private var extension = new MeetingExtensionProp

  val startedOn = timeNowInMinutes;

  def isExtensionAllowed(): Boolean = extension.numExtensions < extension.maxExtensions
  def incNumExtension(): Int = {
    if (extension.numExtensions < extension.maxExtensions) {
      extension = extension.copy(numExtensions = extension.numExtensions + 1); extension.numExtensions
    }
    extension.numExtensions
  }

  def notice15MinutesSent() = extension = extension.copy(sent15MinNotice = true)
  def notice10MinutesSent() = extension = extension.copy(sent10MinNotice = true)
  def notice5MinutesSent() = extension = extension.copy(sent5MinNotice = true)

  def getMeetingExtensionProp(): MeetingExtensionProp = extension
  def muteMeeting() = meetingMuted = true
  def unmuteMeeting() = meetingMuted = false
  def isMeetingMuted(): Boolean = meetingMuted
  def recordingStarted() = recording = true
  def recordingStopped() = recording = false
  def isRecording(): Boolean = recording
  def lastWebUserLeft() = lastWebUserLeftOnTimestamp = timeNowInMinutes
  def lastWebUserLeftOn(): Long = lastWebUserLeftOnTimestamp
  def resetLastWebUserLeftOn() = lastWebUserLeftOnTimestamp = 0
  def setVoiceRecordingFilename(path: String) = voiceRecordingFilename = path
  def getVoiceRecordingFilename(): String = voiceRecordingFilename
  def permisionsInitialized(): Boolean = permissionsInited
  def initializePermissions() = permissionsInited = true
  def audioSettingsInitialized(): Boolean = audioSettingsInited
  def initializeAudioSettings() = audioSettingsInited = true
  def permissionsEqual(other: Permissions): Boolean = permissions == other
  def lockLayout(lock: Boolean) = permissions = permissions.copy(lockedLayout = lock)
  def getPermissions(): Permissions = permissions
  def setPermissions(p: Permissions) = permissions = p
  def meetingHasEnded() = meetingEnded = true
  def hasMeetingEnded(): Boolean = meetingEnded
  def timeNowInMinutes(): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
}