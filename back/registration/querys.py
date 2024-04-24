query_to_receive_data = {
    'about': "SELECT champId, champName, champCity, champType, champFrom, champTo, champRegFrom,"
             " champRegTo FROM dynamic_models_",
    'athletes': "SELECT AthId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender,"
                " DateBR, Weight, CountWinner, CountBall FROM dynamic_models_",
    'category': "SELECT CategoryId, CategoryNameEU, CategoryNameRU, CategoryNameUA, CategoryType, "
                "CategoryBlockCount, Category3Place, Category5Place, CategorySVG, idxAth1Place, "
                "idxAth2Place, idxAth3Place, idxAth4Place, idxAth5Place, idxAth6Place, "
                "idxAth7Place, idxAth8Place, Time FROM dynamic_models_",
    'champ': "SELECT TatamiId, CategoryId, BlockNum, AthIdRed, AthIdWhite, NumDuel, NextDuel, "
             "DuelIsPlace, WinnerRed, WinnerWhite, Level, Duel1Place, Duel3Place, Duel5Place FROM dynamic_models_",
    'club': "SELECT ClubId, ClubName, ClubShortName, ClubCity, RegionId, CountryId, ClubLogo FROM dynamic_models_",
    'coach': "SELECT CoachId, ClubId, CoachName, CountryId, RegionId, EMail, Password FROM dynamic_models_",
    'tatami': "SELECT TatamiId, MacCountFight, CurrentDuel, OnLineFile FROM dynamic_models_"
}


rows_of_tables = {
    'about': ['id', 'champId', 'champName', 'champCity', 'champType', 'champFrom', 'champTo',
              'champRegFrom', 'champRegTo'],
    'athletes': ['AthId', 'CoachId', 'ClubId', 'CountryId', 'RegionId', 'FIO', 'Photo', 'DAN',
                 'Gender', 'DateBR', 'Weight', 'CountWinner', 'CountBall']
}
