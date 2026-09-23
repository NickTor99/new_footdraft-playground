from typing import List
from models.EvensOddsChoice import EvensOddsChoice


class Captain:
    def __init__(self,  userId: str, username: str, pickedPlayers: List[str] = [], initialChoice: EvensOddsChoice = None):
        self.initialChoice = initialChoice
        self.pickedPlayers = pickedPlayers
        self.username = username
        self.userId = userId

    def addPlayer(self, playerId: str):
        self.pickedPlayers.append(playerId)