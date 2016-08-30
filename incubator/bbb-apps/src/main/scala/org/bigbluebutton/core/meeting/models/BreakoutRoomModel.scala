package org.bigbluebutton.core.meeting.models

import org.bigbluebutton.core.domain.{ BreakoutRoom, BreakoutUser }

class BreakoutRoomModel {
  private var rooms = new collection.immutable.HashMap[String, BreakoutRoom]

  def add(room: BreakoutRoom): BreakoutRoom = {
    rooms += room.id -> room
    room
  }

  def remove(id: String) {
    rooms -= id
  }

  def createBreakoutRoom(id: String, name: String, voiceConfId: String,
    assignedUsers: Vector[String], defaultPresentationURL: String): BreakoutRoom = {
    val room = new BreakoutRoom(id, name, voiceConfId, assignedUsers, Vector(), defaultPresentationURL)
    add(room)
  }

  def getBreakoutRoom(id: String): Option[BreakoutRoom] = {
    rooms.get(id)
  }

  def getRooms(): Array[BreakoutRoom] = {
    rooms.values.toArray
  }

  def getAssignedUsers(breakoutId: String): Option[Vector[String]] = {
    for {
      room <- rooms.get(breakoutId)
    } yield room.assignedUsers
  }

  def updateBreakoutUsers(breakoutId: String, users: Vector[BreakoutUser]): Option[BreakoutRoom] = {
    for {
      room <- rooms.get(breakoutId)
      newroom = room.copy(users = users)
      room2 = add(newroom)
    } yield room2
  }
}

