package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer

trait PollApp {
  this: MeetingActor =>

  val outGW: MessageOutGateway

  private val pollModel = new PollModel

  private def buildAnswers(questionType: String, answersVO: Option[Array[AnswerVO]]): Array[Answer] = {
    var answers = new ArrayBuffer[Answer]()

    //    answersVO match {
    //      case Some(Array[AnswerVO]) => answers = buildAnswersFromVO(answersVO.get)
    //      case None => answers = buildAnswersFromQuestionType(questionType)
    //    }

    answers.toArray
  }

  private def buildAnswersFromQuestionType(questionType: String): ArrayBuffer[Answer] = {
    val answers = new ArrayBuffer[Answer]

    val qType = """(YN)|(TF)|(A[1-5])|(1[1-5])"""

    questionType.toUpperCase() match {
      case "TF" => //
      case "YN" => //
    }

    answers
  }

  private def buildAnswersFromVO(answersVO: Array[AnswerVO]): ArrayBuffer[Answer] = {
    val answers = new ArrayBuffer[Answer]
    answersVO.foreach { rv => answers += new Answer(rv.id, rv.key, rv.text) }

    answers
  }

  def createPoll(id: String, questions: Array[QuestionVO], title: Option[String]) {
    val qs = new ArrayBuffer[Question]

    questions.foreach { qv =>
      var answers = buildAnswers(qv.questionType, qv.answers)

      //          qs += new Question(qv.id, qv.multiResponse, qv.question, responses.toArray)

    }
  }

  /*  
  def handleHidePollResult(msg: HidePollResult) {
    val pollID = msg.pollID

    if (pollModel.hasPoll(pollID)) {
      pollModel.hidePollResult(pollID)
      outGW.send(new PollHideResultOutMsg(meetingID, recorded, pollID))
    }
  }

  def handleShowPollResult(msg: ShowPollResult) {
    val pollID = msg.pollID

    if (pollModel.hasPoll(pollID)) {
      pollModel.showPollResult(pollID)
      outGW.send(new PollShowResultOutMsg(meetingID, recorded, pollID))
    }
  }

  def handleRespondToPoll(msg: RespondToPoll) {
    val pollID = msg.response.pollID

    if (pollModel.hasPoll(pollID)) {
      if (hasUser(msg.requesterID)) {
        getUser(msg.requesterID) match {
          case Some(user) => {
            val responder = new Responder(user.userID, user.name)
            msg.response.responses.foreach(question => {
              question.responseIDs.foreach(response => {
                pollModel.respondToQuestion(pollID, question.questionID, response, responder)
              })
            })

            pollModel.getPoll(msg.response.pollID) match {
              case Some(poll) => outGW.send(new PollResponseOutMsg(meetingID, recorded, responder, msg.response))
              case None => // do nothing
            }
          }
          case None => //do nothing
        }
      }
    }
  }

  def handleGetPolls(msg: GetPolls) {
    var polls = pollModel.getPolls
    outGW.send(new GetPollsReplyOutMsg(meetingID, recorded, msg.requesterID, polls))
  }

  def handleClearPoll(msg: ClearPoll) {
    if (pollModel.clearPoll(msg.pollID)) {
      outGW.send(new PollClearedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleClearPoll - " + msg.pollID + " not found")
    }
  }

  def handleStartPoll(msg: StartPoll) {
    if (pollModel.hasPoll(msg.pollID)) {
      pollModel.startPoll(msg.pollID)
      outGW.send(new PollStartedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleStartPoll - " + msg.pollID + " not found")
    }
  }

  def handleStopPoll(msg: StopPoll) {
    if (pollModel.hasPoll(msg.pollID)) {
      pollModel.stopPoll(msg.pollID)
      outGW.send(new PollStoppedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleStopPoll - " + msg.pollID + " not found")
    }
  }

  def handleSharePoll(msg: SharePoll) {

  }

  def handleRemovePoll(msg: RemovePoll) {
    if (pollModel.hasPoll(msg.pollID)) {
      pollModel.removePoll(msg.pollID)
      outGW.send(new PollRemovedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleRemovePoll - " + msg.pollID + " not found")
    }
  }

  def handleDestroyPoll(msg: DestroyPoll) {

  }

  def handleUpdatePoll(msg: UpdatePoll) {
    if (pollModel.updatePoll(msg.poll)) {
      outGW.send(new PollUpdatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))
    } else {
      print("PollApp:: handleUpdatePoll - " + msg.poll.id + " not found")
    }
  }

  def handlePreCreatedPoll(msg: PreCreatedPoll) {
    pollModel.createPoll(msg.poll)
    outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))
  }

  def handleCreatePoll(msg: CreatePoll) {
    pollModel.createPoll(msg.poll)
    outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))
  }
  
  */
}