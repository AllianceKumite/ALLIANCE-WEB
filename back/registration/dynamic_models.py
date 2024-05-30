from inspect import currentframe
from django.db import connection

fieldsAthChamp = {'CoachId': 'integer', 'ClubId': 'integer', 'CountryId': 'integer', 'CategoryId': 'integer',
                  'RegionId': 'integer', 'FIO': 'text', 'Photo': 'text', 'DAN': 'text', 'Gender': 'text',
                  'DateBR': 'date', 'Weight': 'integer', 'CountWinner': 'integer',
                  'CountBall': 'float', 'Kumite': 'boolean', 'Kata': 'boolean', 'KataGroup': 'boolean', 'Favorit1': 'boolean', 'Favorit2': 'boolean'}
fieldsAllChamp = {'champName': 'text', 'champCity': 'text', 'champType': 'integer', 'champFrom': 'date',
                  'champTo': 'date', 'champRegFrom': 'date', 'champRegTo': 'date'}
fieldsCategoryChamp = {'CategoryNameEN': 'text', 'CategoryNameRU': 'text', 'CategoryNameUA': 'text',
                       'CategoryType': 'integer', 'CategoryBlockCount': 'integer', 'Category3Place': 'boolean',
                       'Category5Place': 'boolean', 'CategorySVG': 'text', 'idxAth1Place': 'integer',
                       'idxAth2Place': 'integer', 'idxAth3Place': 'integer', 'idxAth4Place': 'integer',
                       'idxAth5Place': 'integer', 'idxAth6Place': 'integer', 'idxAth7Place': 'integer',
                       'idxAth8Place': 'integer', 'Time': 'integer'}
fieldsChampChamp = {'CategoryId': 'integer', 'BlockNum': 'integer', 'AthIdRed': 'integer',
                    'AthIdWhite': 'integer', 'NumDuel': 'integer', 'NextDuel': 'integer',
                    'DuelIsPlace': 'boolean', 'WinnerRed': 'boolean', 'WinnerWhite': 'boolean',
                    'Level': 'integer', 'Duel1Place': 'boolean', 'Duel3Place': 'boolean', 'Duel5Place': 'boolean'}
fieldsClubChamp = {'ClubName': 'text', 'ClubShortName': 'text', 'ClubCity': 'text', 'RegionId': 'integer',
                   'CountryId': 'integer', 'ClubLogo': 'text'}
fieldsCoachChamp = {'ClubId': 'integer', 'CoachName': 'text', 'CountryId': 'integer', 'RegionId': 'integer',
                    'EMail': 'text', 'Password': 'text'}
fieldsTatamiChamp = {'MacCountFight': 'integer', 'CurrentDuel': 'integer', 'OnLineFile': 'text'}


# sorting cyryllic letter i: FOR correct sorting utf8mb4 is needed
# TODO: create local tables with correct collation utf8mb4 (not utf)
# # Запустите это один раз для каждой схемы (замените database_name на имя схемы)
# -- ALTER DATABASE database_name CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
# -- ALTER DATABASE karate_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# # Запустите это один раз для каждой таблицы (замените table_name именем таблицы)
# -- ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# -- ALTER TABLE coaches CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# # Выполните это для каждого столбца (замените имя таблицы, column_name, тип столбца, максимальную длину и т. д.)
# -- ALTER TABLE table_name CHANGE column_name column_name VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# ALTER TABLE coaches CHANGE coachName coachName VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
class CreateDynamicChamp:
    def __init__(self, title):
        self.title = title

    def create_coach(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_coach ( ownId int AUTO_INCREMENT PRIMARY KEY, ' +
                                                      'CoachId int NOT NULL, ClubId int NOT NULL, ' +
                                                      'CoachName varchar(256) NOT NULL, CountryId int NOT NULL, ' +
                                                      'RegionId int,' +
                                                      ' City varchar(256), Email varchar(256), Password varchar(256))')

    def create_club(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_club ( ownId int AUTO_INCREMENT PRIMARY KEY, ClubId int NOT' +
                                                      ' NULL, ClubName varchar(256) NOT NULL, ClubShortName ' +
                                                      'varchar(256), ClubCity varchar(256), RegionId int' +
                                                      ', CountryId int, ClubLogo varchar(256) DEFAULT NULL, OrgId int' +
                                                      ')')

    def create_champ(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_champ ( ' +
            'ownId int AUTO_INCREMENT PRIMARY KEY, ' +
            'TatamiId int NOT NULL, ' +
            'CategoryId int NOT NULL, ' +
            'BlockNum int NOT NULL, ' +
            'AthIdRed int NOT NULL, ' +
            'AthIdWhite int NOT NULL, ' +
            'NumDuel int NOT NULL, ' +
            'NextDuel int NOT NULL, ' +
            'DuelIsPlace bool NOT NULL, ' +
            'WinnerRed bool NOT NULL, ' +
            'WinnerWhite bool NOT NULL, ' +
            'Level int NOT NULL, ' +
            'Duel1Place bool NOT NULL, ' +
            'Duel3Place bool NOT NULL, ' +
            'Duel5Place bool NOT NULL, ' +
            'Duel7Place bool NOT NULL, ' +
            'LevePair int NOT NULL, ' +
            'NumPair int NOT NULL, ' +
            'UpDuelRed int NOT NULL, ' +
            'UpDuelWhite int NOT NULL, ' +
            'pointsRed int NOT NULL, ' +
            'pointsWhite int NOT NULL, ' +

            'Chu1R bool, ' +
            'Chu2R bool, ' +
            'Chu3R bool, ' +
            'Vaz1R bool, ' +
            'Vaz2R bool, ' +
            'IpponR bool, ' +

            'Chu1W bool, ' +
            'Chu2W bool, ' +
            'Chu3W bool, ' +
            'Vaz1W bool, ' +
            'Vaz2W bool, ' +
            'IpponW bool, ' +

            'TimeRemain float, ' +
            'Refery1 float, ' +
            'Refery2 float, ' +
            'Refery3 float, ' +
            'Refery4 float, ' +
            'Refery5 float, ' +
            'Avg float ' +
        ')')

    def create_ath_champ(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_athchamp ( ' +
            'ownId int AUTO_INCREMENT PRIMARY KEY, ' +
            'athId int NOT NULL, ' +
            'CoachId int NOT NULL, ' +
            'ClubId int NOT NULL, ' +
            'CountryId int, ' +
            'RegionId int, ' +
            'CategoryId int, ' +
            'Category2Id int, ' +
            'FIO varchar(256) NOT NULL, ' +
            'Photo varchar(256) NOT NULL, ' +
            'DAN varchar(10) NOT NULL, ' +
            'Gender varchar(40) NOT NULL, ' +
            'DateBR date NOT NULL, ' +
            'Age int, ' +
            'Weight float, ' +
            'CountWinner int, ' +
            'CountBall float, ' +
            'CountBallKata float, ' +
            'OrdNum varchar(256), ' +
            'Kumite bool, ' +
            'Kata bool, ' +
            'KataGroup bool, ' +
            'Favorit1 bool, ' +
            'Favorit2 bool, ' +
            'CountVazary int, ' +
            'CountIppon int, ' +
            'CountRefery int,' +
            'Division int DEFAULT -1,' +
            'lvl1 int DEFAULT -1,' +
            'lvl2 int DEFAULT -1,' +
            'lvl3 int DEFAULT -1,' +
            'lvl4 int DEFAULT -1,' +
            'lvl5 int DEFAULT -1,' +
            'lvl6 int DEFAULT -1,' +
            'lvl7 int DEFAULT -1,' +
            'lvl8 int DEFAULT -1,' +
            'lvl12 int DEFAULT -1,' +
            'teamcompetition bool' +
        ')')

    def create_ath_online(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE athonline (' +
            'athId int AUTO_INCREMENT PRIMARY KEY, ' +
            'CoachId int NOT NULL, ' +
            'ClubId int NOT NULL, ' +
            'CountryId int, ' +
            'RegionId int, ' +
            'FIO varchar(256) NOT NULL, ' +
            'Photo varchar(256) NOT NULL, ' +
            'DAN varchar(10) NOT NULL, ' +
            'Gender varchar(40) NOT NULL, ' +
            'DateBR date NOT NULL, ' +
            'Age int, ' +
            'Weight float, ' +
            'Participant bool, ' +
            'Kumite bool, ' +
            'Kata bool, ' +
            'KataGroup bool, ' +
            'Favorit1 bool, ' +
            'Favorit2 bool),'+
            'Division int DEFAULT -1,' +
            'lvl1 int DEFAULT -1,' +
            'lvl2 int DEFAULT -1,' +
            'lvl3 int DEFAULT -1,' +
            'lvl4 int DEFAULT -1,' +
            'lvl5 int DEFAULT -1,' +
            'lvl6 int DEFAULT -1,' +
            'lvl7 int DEFAULT -1,' +
            'lvl8 int DEFAULT -1,' +
            'lvl12 int DEFAULT -1,' +
            'teamcompetition bool' 
        )

    def create_category(self):
        cursor = connection.cursor()
        # cursor.execute('CREATE TABLE ' + self.title + '_category ( ownId int AUTO_INCREMENT PRIMARY KEY, ' +
        #                                               'categoryId int NOT NULL, CategoryNameEn varchar(256) ' +
        #                                               'NOT NULL, CategoryNameRU varchar(256) NOT NULL, CategoryNameUa' +
        #                                               ' varchar(256) NOT NULL, CategoryType int NOT NULL, ' +
        #                                               'CategoryBlockCount int NOT NULL, Category3Place bool ' +
        #                                               'NOT NULL, Category5Place bool NOT NULL, CategorySVG ' +
        #                                               'varchar(256) NOT NULL, idxAth1PlaceRed int, idxAth2PlaceRed' +
        #                                               ' int, idxAth3PlaceRed int, idxAth4PlaceRed int, ' +
        #                                               'idxAth5PlaceRed int, idxAth6PlaceRed int, idxAth7PlaceRed' +
        #                                               ' int, idxAth8PlaceRed int, idxAth1PlaceWhite int, ' +
        #                                               'idxAth2PlaceWhite int, idxAth3PlaceWhite int, ' +
        #                                               'idxAth4PlaceWhite int, idxAth5PlaceWhite int, ' +
        #                                               'idxAth6PlaceWhite int, idxAth7PlaceWhite int, ' +
        #                                               'idxAth8PlaceWhite int)')

        cursor.execute('CREATE TABLE ' + self.title + '_category ( ' +
            'ownId int AUTO_INCREMENT PRIMARY KEY, ' +
            'categoryId int NOT NULL, ' +
            'CategoryNameEn varchar(256) NOT NULL, ' +
            'CategoryNameRU varchar(256) NOT NULL, ' +
            'CategoryNameUa varchar(256) NOT NULL, ' +
            'CategoryType int NOT NULL, ' +
            'CategoryBlockCount int NOT NULL, ' +
            'Category3Place bool NOT NULL, ' +
            'Category5Place bool NOT NULL, ' +
            'CategorySVG varchar(256) NOT NULL, ' +
            'idxAth1Place int, ' +
            'idxAth2Place int, ' +
            'idxAth3Place int, ' +
            'idxAth4Place int, ' +
            'idxAth5Place int, ' +
            'idxAth6Place int, ' +
            'idxAth7Place int, ' +
            'idxAth8Place int, ' +
            'Time int, ' +
            'TimeDuel1 int, ' +
            'TimeDuel2 int, ' +
            'TimeDuel3 int, ' +
            'TimeDuel4 int, ' +
            'TimeDuel5 int, ' +
            'TimeFDuel1 int, ' +
            'TimeFDuel2 int, ' +
            'TimeFDuel3 int, ' +
            'TimeFDuel4 int, ' +
            'TimeFDuel5 int, ' +
            'WeightFrom float, ' +
            'WeightTo float, ' +
            'KataGroup int DEFAULT 0, ' +
            'LevelCircle int DEFAULT 0 ' +
        ')')


    def create_tatami(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_tatami ( ' +
            'id int AUTO_INCREMENT PRIMARY KEY, ' +
            'url varchar(256) NOT NULL, ' +
            'actualTime int ' +
        ')')

    def create_refery(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_refery ( ' +
            'ReferyId int AUTO_INCREMENT PRIMARY KEY, ' +
            'CoachId int NOT NULL, ' +
            'ClubId int NOT NULL, ' +
            'CountryId int NOT NULL, ' +
            'FIO varchar(256) NOT NULL, ' +
            'DateBR date NOT NULL, ' +
            'DAN varchar(10) NOT NULL, ' +
            'Gender varchar(40) NOT NULL, ' +
            'TatamiId int DEFAULT -1, ' +
            'BrigadeId int DEFAULT -1, ' +
            'sushin int DEFAULT -1' +
        ')')

    def create_kata(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_kata ( ' +
            'ownId int AUTO_INCREMENT PRIMARY KEY, ' +
            'KataId int NOT NULL, ' +
            'KataNameEn varchar(256) NOT NULL, ' +
            'KataNameRu varchar(256) NOT NULL, ' +
            'KataNameUa varchar(256) NOT NULL ' +
        ')')

    def create_katagroup(self):
        cursor = connection.cursor()
        cursor.execute('CREATE TABLE ' + self.title + '_katagroup ( ' +
            'ownId int AUTO_INCREMENT PRIMARY KEY, ' +
            'KataGrpId int NOT NULL, ' +
            'AlwaysNoRepet boolean NOT NULL, ' +
            'KataGrpNameEn varchar(256) NOT NULL, ' +
            'KataGrpNameRu varchar(256) NOT NULL, ' +
            'KataGrpNameUa varchar(256) NOT NULL, ' +
            'KataGrpMandatList varchar(256) NOT NULL, ' +
            'KataGrpChooseList varchar(256) NOT NULL ' +
        ')')
