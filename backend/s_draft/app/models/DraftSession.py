from typing import List

from models.Captain import Captain
from models.DraftMove import DraftMove
from models.DraftStatus import DraftStatus
from models.EvensOddsChoice import EvensOddsChoice


class DraftSession:
    def __init__(self,
                 sessionId: str,
                 groupId: str,
                 name: str,
                 availablePlayers: List[str],
                 captain1: Captain,
                 captain2: Captain = None,
                 status: DraftStatus = DraftStatus.WAITING_FOR_CAPTAIN2,
                 turnOrder=None,
                 lastMove: DraftMove = None,
                 currentTurnIndex: int = 0,
                 ):
        self.groupId = groupId
        self.name = name
        if turnOrder is None:
            self.turnOrder = [''] * len(availablePlayers)
        else:
            self.turnOrder = turnOrder
        self.captain2 = captain2
        self.captain1 = captain1
        self.lastMove = lastMove
        self.availablePlayers = availablePlayers
        self.currentTurnIndex = currentTurnIndex
        self.status = status
        self.sessionId = sessionId

    def joinCaptain(self, captain2: Captain):
        if self.status == DraftStatus.WAITING_FOR_CAPTAIN2:
            self.captain2 = captain2
            self.status = DraftStatus.WAIT_EVENS_ODDS_CHOICE_CAP1
        else:
            raise Exception()

    def createTurnOrder(self):
        if self.captain1.initialChoice is None or self.captain2.initialChoice is None:
            raise Exception()
        if self.status != DraftStatus.WAIT_EVENS_ODDS_CHOICE_CAP2:
            raise Exception()

        value = self.captain1.initialChoice['number'] + self.captain2.initialChoice.number

        is_even = value % 2 == 0

        i = 0
        if (self.captain1.initialChoice['choice'] == "Even" and is_even) or (
                self.captain1.initialChoice['choice'] == "Odd" and not is_even):
            # Captain 1 wins
            while i < len(self.availablePlayers):
                self.turnOrder[i] = self.captain1.userId
                self.turnOrder[i + 1] = self.captain2.userId
                i += 2
            self.status = DraftStatus.CAPTAIN1_SELECTING
        else:
            # Captain 2 wins
            while i < len(self.availablePlayers):
                self.turnOrder[i] = self.captain2.userId
                self.turnOrder[i + 1] = self.captain1.userId
                i += 2
            self.status = DraftStatus.CAPTAIN2_SELECTING

    def isCaptainTurn(self, userId: str) -> bool:
        if self.turnOrder[self.currentTurnIndex] == userId:
            return True
        else:
            return False

    def nextTurn(self):
        self.currentTurnIndex += 1
        if self.status == DraftStatus.FINISHED:
            return
        if self.status == DraftStatus.CAPTAIN1_SELECTING:
            self.status = DraftStatus.CAPTAIN2_SELECTING
        elif self.status == DraftStatus.CAPTAIN2_SELECTING:
            self.status = DraftStatus.CAPTAIN1_SELECTING
        else:
            raise Exception()

    def getCaptain(self, userId: str) -> Captain:
        if self.captain1.userId == userId:
            return self.captain1
        elif self.captain2.userId == userId:
            return self.captain2
        else:
            raise Exception()

    def isCaptain1(self, userId: str) -> bool:
        if self.captain1.userId == userId:
            return True
        return False

    def isCaptain2(self, userId: str) -> bool:
        if self.captain2.userId == userId:
            return True
        return False

    def pickPlayer(self, playerId, userId):
        if self.isCaptainTurn(userId):
            cap = self.getCaptain(userId)
            cap.addPlayer(playerId)
            self.updateAvailablePlayers(playerId)
            if len(self.availablePlayers) == 0:
                self.status = DraftStatus.FINISHED
        else:
            raise Exception()

    def updateAvailablePlayers(self, playerId):
        try:
            self.availablePlayers.remove(playerId)
        except ValueError as v:
            raise Exception()



