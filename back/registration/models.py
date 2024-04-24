# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.conf import settings

class Athletes(models.Model):
    athId = models.AutoField(db_column='athId', primary_key=True)  # Field name made lowercase.
    fio = models.TextField(db_column='FIO')  # Field name made lowercase.
    photo = models.TextField(blank=True, null=True)
    dan = models.TextField(db_column='DAN')  # Field name made lowercase.
    gender = models.TextField()
    datebr = models.DateField(db_column='dateBR')  # Field name made lowercase.
    weight = models.FloatField()
    clubId = models.ForeignKey('Clubs', models.DO_NOTHING, db_column='clubId')  # Field name made lowercase.
    coachId = models.ForeignKey('Coaches', models.DO_NOTHING, db_column='coachId')  # Field name made lowercase.
    countryId = models.ForeignKey('Countries', models.DO_NOTHING, db_column='countryId', blank=True, null=True)  # Field name made lowercase.
    regionId = models.ForeignKey('Regions', models.DO_NOTHING, db_column='regionId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'athletes'


class AthletesImages(models.Model):
    fileId = models.AutoField(db_column='fileId', primary_key=True)  # Field name made lowercase.
    image = models.CharField(max_length=100)

    class Meta:
        db_table = 'athletes_images'


class Athonline(models.Model):
    athId = models.AutoField(db_column='athId', primary_key=True)  # Field name made lowercase.
    coachId = models.IntegerField(db_column='CoachId')  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId', blank=True, null=True)  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId', blank=True, null=True)  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId', blank=True, null=True)  # Field name made lowercase.
    fio = models.CharField(db_column='FIO', max_length=256)  # Field name made lowercase.
    photo = models.CharField(db_column='Photo', max_length=256)  # Field name made lowercase.
    dan = models.CharField(db_column='DAN', max_length=10)  # Field name made lowercase.
    gender = models.CharField(db_column='Gender', max_length=40)  # Field name made lowercase.
    datebr = models.DateField(db_column='DateBR')  # Field name made lowercase.
    weight = models.FloatField(db_column='Weight', blank=True, null=True)  # Field name made lowercase.
    participant = models.IntegerField(db_column='Participant', blank=True, null=True)  # Field name made lowercase.
    kumite = models.IntegerField(db_column='Kumite', blank=True, null=True)  # Field name made lowercase.
    kata = models.IntegerField(db_column='Kata', blank=True, null=True)  # Field name made lowercase.
    kataGroup = models.IntegerField(db_column='KataGroup', blank=True, null=True)  # Field name made lowercase.
    favorit1 = models.IntegerField(db_column='Favorit1', blank=True, null=True)  # Field name made lowercase.
    favorit2 = models.IntegerField(db_column='Favorit2', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'athonline'


# class AuthGroup(models.Model):
#     name = models.CharField(unique=True, max_length=150)

#     class Meta:
#         db_table = 'auth_group'


# class AuthGroupPermissions(models.Model):
#     group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
#     permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

#     class Meta:
#         db_table = 'auth_group_permissions'
#         unique_together = (('group', 'permission'),)


# class AuthPermission(models.Model):
#     name = models.CharField(max_length=255)
#     content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
#     codename = models.CharField(max_length=100)

#     class Meta:
#         db_table = 'auth_permission'
#         unique_together = (('content_type', 'codename'),)


# class AuthUser(models.Model):
#     password = models.CharField(max_length=128)
#     last_login = models.DateTimeField(blank=True, null=True)
#     is_superuser = models.IntegerField()
#     username = models.CharField(max_length=150)
#     first_name = models.CharField(max_length=150)
#     last_name = models.CharField(max_length=150)
#     email = models.CharField(max_length=254)
#     is_staff = models.IntegerField()
#     is_active = models.IntegerField()
#     date_joined = models.DateTimeField()

#     class Meta:
#         db_table = 'auth_user'


# class AuthUserGroups(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING)
#     group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

#     class Meta:
#         db_table = 'auth_user_groups'
#         unique_together = (('user', 'group'),)


# class AuthUserUserPermissions(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING)
#     permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

#     class Meta:
#         db_table = 'auth_user_user_permissions'
#         unique_together = (('user', 'permission'),)


# class AuthtokenToken(models.Model):
#     key = models.CharField(primary_key=True, max_length=40)
#     created = models.DateTimeField()
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, models.DO_NOTHING)

#     class Meta:
#         db_table = 'authtoken_token'


class Branch(models.Model):
    branchId = models.AutoField(db_column='branchId', primary_key=True)  # Field name made lowercase.
    branchName = models.CharField(db_column='branchName', max_length=225)  # Field name made lowercase.

    class Meta:
        db_table = 'branch'


class ChampKwu2022Athchamp(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    athId = models.IntegerField(db_column='athId')  # Field name made lowercase.
    coachId = models.IntegerField(db_column='CoachId')  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId', blank=True, null=True)  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId', blank=True, null=True)  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId', blank=True, null=True)  # Field name made lowercase.
    categoryId = models.IntegerField(db_column='CategoryId', blank=True, null=True)  # Field name made lowercase.
    fio = models.CharField(db_column='FIO', max_length=256)  # Field name made lowercase.
    photo = models.CharField(db_column='Photo', max_length=256)  # Field name made lowercase.
    dan = models.CharField(db_column='DAN', max_length=10)  # Field name made lowercase.
    gender = models.CharField(db_column='Gender', max_length=40)  # Field name made lowercase.
    datebr = models.DateField(db_column='DateBR')  # Field name made lowercase.
    weight = models.FloatField(db_column='Weight', blank=True, null=True)  # Field name made lowercase.
    countWinner = models.IntegerField(db_column='CountWinner', blank=True, null=True)  # Field name made lowercase.
    countBall = models.IntegerField(db_column='CountBall', blank=True, null=True)  # Field name made lowercase.
    ordNum = models.CharField(db_column='OrdNum', max_length=256, blank=True, null=True)  # Field name made lowercase.
    kumite = models.IntegerField(db_column='Kumite', blank=True, null=True)  # Field name made lowercase.
    kata = models.IntegerField(db_column='Kata', blank=True, null=True)  # Field name made lowercase.
    kataGroup = models.IntegerField(db_column='KataGroup', blank=True, null=True)  # Field name made lowercase.
    favorit1 = models.IntegerField(db_column='Favorit1', blank=True, null=True)  # Field name made lowercase.
    favorit2 = models.IntegerField(db_column='Favorit2', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'champ_KWU_2022_athchamp'


class ChampKwu2022Category(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    categoryId = models.IntegerField(db_column='categoryId')  # Field name made lowercase.
    categoryNameEn = models.CharField(db_column='CategoryNameEn', max_length=256)  # Field name made lowercase.
    categoryNameRu = models.CharField(db_column='CategoryNameRU', max_length=256)  # Field name made lowercase.
    categoryNameUa = models.CharField(db_column='CategoryNameUa', max_length=256)  # Field name made lowercase.
    categoryType = models.IntegerField(db_column='CategoryType')  # Field name made lowercase.
    categoryBlockCount = models.IntegerField(db_column='CategoryBlockCount')  # Field name made lowercase.
    category3Place = models.IntegerField(db_column='Category3Place')  # Field name made lowercase.
    category5Place = models.IntegerField(db_column='Category5Place')  # Field name made lowercase.
    categorySvg = models.CharField(db_column='CategorySVG', max_length=256)  # Field name made lowercase.
    idxAth1Place = models.IntegerField(db_column='idxAth1Place', blank=True, null=True)  # Field name made lowercase.
    idxAth2Place = models.IntegerField(db_column='idxAth2Place', blank=True, null=True)  # Field name made lowercase.
    idxAth3Place = models.IntegerField(db_column='idxAth3Place', blank=True, null=True)  # Field name made lowercase.
    idxAth4Place = models.IntegerField(db_column='idxAth4Place', blank=True, null=True)  # Field name made lowercase.
    idxAth5Place = models.IntegerField(db_column='idxAth5Place', blank=True, null=True)  # Field name made lowercase.
    idxAth6Place = models.IntegerField(db_column='idxAth6Place', blank=True, null=True)  # Field name made lowercase.
    idxAth7Place = models.IntegerField(db_column='idxAth7Place', blank=True, null=True)  # Field name made lowercase.
    idxAth8Place = models.IntegerField(db_column='idxAth8Place', blank=True, null=True)  # Field name made lowercase.
    time = models.IntegerField(db_column='Time', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'champ_KWU_2022_category'


class ChampKwu2022Champ(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    tatamiId = models.IntegerField(db_column='TatamiId')  # Field name made lowercase.
    categoryId = models.IntegerField(db_column='CategoryId')  # Field name made lowercase.
    blockNum = models.IntegerField(db_column='BlockNum')  # Field name made lowercase.
    athIdRed = models.IntegerField(db_column='AthIdRed')  # Field name made lowercase.
    athIdWhite = models.IntegerField(db_column='AthIdWhite')  # Field name made lowercase.
    numDuel = models.IntegerField(db_column='NumDuel')  # Field name made lowercase.
    nextDuel = models.IntegerField(db_column='NextDuel')  # Field name made lowercase.
    duelIsPlace = models.IntegerField(db_column='DuelIsPlace')  # Field name made lowercase.
    winnerRed = models.IntegerField(db_column='WinnerRed')  # Field name made lowercase.
    winnerWhite = models.IntegerField(db_column='WinnerWhite')  # Field name made lowercase.
    level = models.IntegerField(db_column='Level')  # Field name made lowercase.
    duel1Place = models.IntegerField(db_column='Duel1Place')  # Field name made lowercase.
    duel3Place = models.IntegerField(db_column='Duel3Place')  # Field name made lowercase.
    duel5Place = models.IntegerField(db_column='Duel5Place')  # Field name made lowercase.
    duel7Place = models.IntegerField(db_column='Duel7Place')  # Field name made lowercase.
    levePair = models.IntegerField(db_column='LevePair')  # Field name made lowercase.
    numPair = models.IntegerField(db_column='NumPair')  # Field name made lowercase.
    upduelRed = models.IntegerField(db_column='UpDuelRed')  # Field name made lowercase.
    upduelWhite = models.IntegerField(db_column='UpDuelWhite')  # Field name made lowercase.
    pointsRed = models.IntegerField(db_column='pointsRed')  # Field name made lowercase.
    pointsWhite = models.IntegerField(db_column='pointsWhite')  # Field name made lowercase.

    class Meta:
        db_table = 'champ_KWU_2022_champ'


class ChampKwu2022Club(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId')  # Field name made lowercase.
    clubName = models.CharField(db_column='ClubName', max_length=256)  # Field name made lowercase.
    clubShortName = models.CharField(db_column='ClubShortName', max_length=256, blank=True, null=True)  # Field name made lowercase.
    clubCity = models.CharField(db_column='ClubCity', max_length=256, blank=True, null=True)  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId', blank=True, null=True)  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId', blank=True, null=True)  # Field name made lowercase.
    clubLogo = models.CharField(db_column='ClubLogo', max_length=256, blank=True, null=True)  # Field name made lowercase.
    orgId = models.IntegerField(db_column='OrgId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'champ_KWU_2022_club'


class ChampKwu2022Coach(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    coachId = models.IntegerField(db_column='CoachId')  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId')  # Field name made lowercase.
    coachName = models.CharField(db_column='CoachName', max_length=256)  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId')  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId')  # Field name made lowercase.
    city = models.CharField(db_column='City', max_length=256, blank=True, null=True)  # Field name made lowercase.
    email = models.CharField(db_column='Email', max_length=256, blank=True, null=True)  # Field name made lowercase.
    password = models.CharField(db_column='Password', max_length=256, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'champ_KWU_2022_coach'


class ChampKwu2022Tatami(models.Model):
    id = models.IntegerField(primary_key=True)
    url = models.CharField(max_length=255)
    actualTime = models.IntegerField(db_column='actualTime')  # Field name made lowercase.

    class Meta:
        db_table = 'champ_KWU_2022_tatami'


class Champs(models.Model):
    champId = models.AutoField(db_column='champId', primary_key=True)  # Field name made lowercase.
    champRegFrom = models.DateField(db_column='champRegFrom', blank=True, null=True)  # Field name made lowercase.
    champRegTo = models.DateField(db_column='champRegTo', blank=True, null=True)  # Field name made lowercase.
    champFrom = models.DateField(db_column='champFrom', blank=True, null=True)  # Field name made lowercase.
    champTo = models.DateField(db_column='champTo', blank=True, null=True)  # Field name made lowercase.
    champNameEn = models.CharField(db_column='champNameEn', max_length=200, blank=True, null=True)  # Field name made lowercase.
    champNameRu = models.CharField(db_column='champNameRu', max_length=200, blank=True, null=True)  # Field name made lowercase.
    champNameUa = models.CharField(db_column='champNameUa', max_length=200, blank=True, null=True)  # Field name made lowercase.
    champCityEn = models.CharField(db_column='champCityEn', max_length=100, blank=True, null=True)  # Field name made lowercase.
    champCityRu = models.CharField(db_column='champCityRu', max_length=100, blank=True, null=True)  # Field name made lowercase.
    champCityUa = models.CharField(db_column='champCityUa', max_length=100, blank=True, null=True)  # Field name made lowercase.
    champType = models.IntegerField(db_column='champType', blank=True, null=True)  # Field name made lowercase.
    typeTatami = models.IntegerField(db_column='typeTatami', blank=True, null=True)  # Field name made lowercase.
    title = models.TextField(blank=True, null=True)
    actualTime = models.IntegerField(db_column='actualTime', blank=True, null=True)  # Field name made lowercase.
    typeCheckCircle = models.IntegerField(db_column='typeCheckCircle', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'champs'


class City(models.Model):
    cityId = models.AutoField(db_column='cityId', primary_key=True)  # Field name made lowercase.
    cityName = models.CharField(db_column='cityName', max_length=225)  # Field name made lowercase.
    countryId = models.ForeignKey('Countries', models.DO_NOTHING, db_column='countryId_id')  # Field name made lowercase.
    regionId = models.ForeignKey('Regions', models.DO_NOTHING, db_column='regionId_id', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'city'


class Clubs(models.Model):
    clubId = models.AutoField(db_column='clubId', primary_key=True)  # Field name made lowercase.
    clubName = models.TextField(db_column='clubName')  # Field name made lowercase.
    clubShortName = models.TextField(db_column='clubShortName', blank=True, null=True)  # Field name made lowercase.
    clubCity = models.TextField(db_column='clubCity', blank=True, null=True)  # Field name made lowercase.
    clubLogo = models.TextField(db_column='clubLogo')  # Field name made lowercase.
    countryId = models.ForeignKey('Countries', models.DO_NOTHING, db_column='countryId', blank=True, null=True)  # Field name made lowercase.
    regionId = models.ForeignKey('Regions', models.DO_NOTHING, db_column='regionId', blank=True, null=True)  # Field name made lowercase.
    orgId = models.ForeignKey('Organization', models.DO_NOTHING, db_column='orgId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'clubs'


class Coaches(models.Model):
    coachId = models.AutoField(db_column='coachId', primary_key=True)  # Field name made lowercase.
    coachName = models.TextField(db_column='coachName')  # Field name made lowercase.
    email = models.TextField(db_column='eMail', blank=True, null=True)  # Field name made lowercase.
    password = models.TextField(blank=True, null=True)
    clubId = models.ForeignKey(Clubs, models.DO_NOTHING, db_column='clubId', blank=True, null=True)  # Field name made lowercase.
    countryId = models.ForeignKey('Countries', models.DO_NOTHING, db_column='countryId', blank=True, null=True)  # Field name made lowercase.
    regionId = models.ForeignKey('Regions', models.DO_NOTHING, db_column='regionId', blank=True, null=True)  # Field name made lowercase.
    user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, db_column='user_Id', blank=True, null=True)
    blocked = models.IntegerField()
    branchId = models.ForeignKey(Branch, models.DO_NOTHING, db_column='branchId', blank=True, null=True)  # Field name made lowercase.
    city = models.ForeignKey(City, models.DO_NOTHING, db_column='city', blank=True, null=True)
    organizationId = models.IntegerField(db_column='organizationId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'coaches'


class Countries(models.Model):
    countryId = models.AutoField(db_column='countryId', primary_key=True)  # Field name made lowercase.
    countryNameEn = models.TextField(db_column='countryNameEn')  # Field name made lowercase.
    countryNameRu = models.TextField(db_column='countryNameRu')  # Field name made lowercase.
    countryNameUa = models.TextField(db_column='countryNameUa')  # Field name made lowercase.
    countryKod = models.TextField(db_column='countryKod')  # Field name made lowercase.
    countryFlag = models.TextField(db_column='countryFlag')  # Field name made lowercase.

    class Meta:
        db_table = 'countries'


class CupWkb12022022Athchamp(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    athId = models.IntegerField(db_column='athId')  # Field name made lowercase.
    coachId = models.IntegerField(db_column='CoachId')  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId')  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId', blank=True, null=True)  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId', blank=True, null=True)  # Field name made lowercase.
    categoryId = models.IntegerField(db_column='CategoryId', blank=True, null=True)  # Field name made lowercase.
    fio = models.CharField(db_column='FIO', max_length=256)  # Field name made lowercase.
    photo = models.CharField(db_column='Photo', max_length=256)  # Field name made lowercase.
    dan = models.CharField(db_column='DAN', max_length=10)  # Field name made lowercase.
    gender = models.CharField(db_column='Gender', max_length=40)  # Field name made lowercase.
    datebr = models.DateField(db_column='DateBR')  # Field name made lowercase.
    weight = models.FloatField(db_column='Weight', blank=True, null=True)  # Field name made lowercase.
    countWinner = models.IntegerField(db_column='CountWinner', blank=True, null=True)  # Field name made lowercase.
    countBall = models.IntegerField(db_column='CountBall', blank=True, null=True)  # Field name made lowercase.
    ordNum = models.CharField(db_column='OrdNum', max_length=256, blank=True, null=True)  # Field name made lowercase.
    kumite = models.IntegerField(db_column='Kumite', blank=True, null=True)  # Field name made lowercase.
    kata = models.IntegerField(db_column='Kata', blank=True, null=True)  # Field name made lowercase.
    kataGroup = models.IntegerField(db_column='KataGroup', blank=True, null=True)  # Field name made lowercase.
    favorit1 = models.IntegerField(db_column='Favorit1', blank=True, null=True)  # Field name made lowercase.
    favorit2 = models.IntegerField(db_column='Favorit2', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'cup_wkb_12_02_2022_athchamp'


class CupWkb12022022Category(models.Model):
    ownid = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    categoryId = models.IntegerField(db_column='categoryId')  # Field name made lowercase.
    categoryNameEn = models.CharField(db_column='CategoryNameEn', max_length=256)  # Field name made lowercase.
    categoryNameRu = models.CharField(db_column='CategoryNameRU', max_length=256)  # Field name made lowercase.
    categoryNameUa = models.CharField(db_column='CategoryNameUa', max_length=256)  # Field name made lowercase.
    categoryType = models.IntegerField(db_column='CategoryType')  # Field name made lowercase.
    categoryBlockCount = models.IntegerField(db_column='CategoryBlockCount')  # Field name made lowercase.
    category3Place = models.IntegerField(db_column='Category3Place')  # Field name made lowercase.
    category5Place = models.IntegerField(db_column='Category5Place')  # Field name made lowercase.
    categorySvg = models.CharField(db_column='CategorySVG', max_length=256)  # Field name made lowercase.
    idxath1Place = models.IntegerField(db_column='idxAth1Place', blank=True, null=True)  # Field name made lowercase.
    idxath2Place = models.IntegerField(db_column='idxAth2Place', blank=True, null=True)  # Field name made lowercase.
    idxath3Place = models.IntegerField(db_column='idxAth3Place', blank=True, null=True)  # Field name made lowercase.
    idxath4Place = models.IntegerField(db_column='idxAth4Place', blank=True, null=True)  # Field name made lowercase.
    idxath5Place = models.IntegerField(db_column='idxAth5Place', blank=True, null=True)  # Field name made lowercase.
    idxath6Place = models.IntegerField(db_column='idxAth6Place', blank=True, null=True)  # Field name made lowercase.
    idxath7Place = models.IntegerField(db_column='idxAth7Place', blank=True, null=True)  # Field name made lowercase.
    idxath8Place = models.IntegerField(db_column='idxAth8Place', blank=True, null=True)  # Field name made lowercase.
    time = models.IntegerField(db_column='Time', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'cup_wkb_12_02_2022_category'


class CupWkb12022022Champ(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    tatamiId = models.IntegerField(db_column='TatamiId')  # Field name made lowercase.
    categoryId = models.IntegerField(db_column='CategoryId')  # Field name made lowercase.
    blockNum = models.IntegerField(db_column='BlockNum')  # Field name made lowercase.
    athidRed = models.IntegerField(db_column='AthIdRed')  # Field name made lowercase.
    athidWhite = models.IntegerField(db_column='AthIdWhite')  # Field name made lowercase.
    numDuel = models.IntegerField(db_column='NumDuel')  # Field name made lowercase.
    nextDuel = models.IntegerField(db_column='NextDuel')  # Field name made lowercase.
    duelisPlace = models.IntegerField(db_column='DuelIsPlace')  # Field name made lowercase.
    winnerRed = models.IntegerField(db_column='WinnerRed')  # Field name made lowercase.
    winnerWhite = models.IntegerField(db_column='WinnerWhite')  # Field name made lowercase.
    level = models.IntegerField(db_column='Level')  # Field name made lowercase.
    duel1Place = models.IntegerField(db_column='Duel1Place')  # Field name made lowercase.
    duel3Place = models.IntegerField(db_column='Duel3Place')  # Field name made lowercase.
    duel5Place = models.IntegerField(db_column='Duel5Place')  # Field name made lowercase.
    duel7Place = models.IntegerField(db_column='Duel7Place')  # Field name made lowercase.
    levePair = models.IntegerField(db_column='LevePair')  # Field name made lowercase.
    numPair = models.IntegerField(db_column='NumPair')  # Field name made lowercase.
    upduelRed = models.IntegerField(db_column='UpDuelRed')  # Field name made lowercase.
    upduelWhite = models.IntegerField(db_column='UpDuelWhite')  # Field name made lowercase.
    pointsRed = models.IntegerField(db_column='pointsRed')  # Field name made lowercase.
    pointsWhite = models.IntegerField(db_column='pointsWhite')  # Field name made lowercase.

    class Meta:
        db_table = 'cup_wkb_12_02_2022_champ'


class CupWkb12022022Club(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId')  # Field name made lowercase.
    clubName = models.CharField(db_column='ClubName', max_length=256)  # Field name made lowercase.
    clubShortName = models.CharField(db_column='ClubShortName', max_length=256, blank=True, null=True)  # Field name made lowercase.
    clubCity = models.CharField(db_column='ClubCity', max_length=256, blank=True, null=True)  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId', blank=True, null=True)  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId', blank=True, null=True)  # Field name made lowercase.
    clubLogo = models.CharField(db_column='ClubLogo', max_length=256, blank=True, null=True)  # Field name made lowercase.
    orgId = models.IntegerField(db_column='OrgId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'cup_wkb_12_02_2022_club'


class CupWkb12022022Coach(models.Model):
    ownId = models.AutoField(db_column='ownId', primary_key=True)  # Field name made lowercase.
    coachId = models.IntegerField(db_column='CoachId')  # Field name made lowercase.
    clubId = models.IntegerField(db_column='ClubId')  # Field name made lowercase.
    coachName = models.CharField(db_column='CoachName', max_length=256)  # Field name made lowercase.
    countryId = models.IntegerField(db_column='CountryId')  # Field name made lowercase.
    regionId = models.IntegerField(db_column='RegionId')  # Field name made lowercase.
    city = models.CharField(db_column='City', max_length=256, blank=True, null=True)  # Field name made lowercase.
    email = models.CharField(db_column='Email', max_length=256, blank=True, null=True)  # Field name made lowercase.
    password = models.CharField(db_column='Password', max_length=256, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'cup_wkb_12_02_2022_coach'


class CupWkb12022022Tatami(models.Model):
    id = models.IntegerField(primary_key=True)
    url = models.CharField(max_length=255)
    actualTime = models.IntegerField(db_column='actualTime')  # Field name made lowercase.

    class Meta:
        db_table = 'cup_wkb_12_02_2022_tatami'


# class DjangoAdminLog(models.Model):
#     action_time = models.DateTimeField()
#     object_id = models.TextField(blank=True, null=True)
#     object_repr = models.CharField(max_length=200)
#     action_flag = models.PositiveSmallIntegerField()
#     change_message = models.TextField()
#     content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING)

#     class Meta:
#         db_table = 'django_admin_log'


# class DjangoContentType(models.Model):
#     app_label = models.CharField(max_length=100)
#     model = models.CharField(max_length=100)

#     class Meta:
#         db_table = 'django_content_type'
#         unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        db_table = 'django_migrations'


# class DjangoSession(models.Model):
#     session_key = models.CharField(primary_key=True, max_length=40)
#     session_data = models.TextField()
#     expire_date = models.DateTimeField()

#     class Meta:
#         db_table = 'django_session'


class DrawImages(models.Model):
    fileid = models.AutoField(db_column='fileId', primary_key=True)  # Field name made lowercase.
    image = models.CharField(max_length=100)

    class Meta:
        db_table = 'draw_images'


# class DynamicModelsFieldschema(models.Model):
#     name = models.CharField(max_length=63)
#     data_type = models.CharField(max_length=16)
#     null = models.IntegerField()
#     unique = models.IntegerField()
#     max_length = models.PositiveIntegerField(blank=True, null=True)
#     model_schema = models.ForeignKey('DynamicModelsModelschema', models.DO_NOTHING)

#     class Meta:
#         db_table = 'dynamic_models_fieldschema'
#         unique_together = (('name', 'model_schema'),)


# class DynamicModelsModelschema(models.Model):
#     name = models.CharField(unique=True, max_length=32)

#     class Meta:
#         db_table = 'dynamic_models_modelschema'


class Organization(models.Model):
    orgId = models.AutoField(db_column='orgId', primary_key=True)  # Field name made lowercase.
    orgName = models.CharField(db_column='orgName', max_length=225)  # Field name made lowercase.
    orgFlag = models.CharField(db_column='orgFlag', max_length=255)  # Field name made lowercase.

    class Meta:
        db_table = 'organization'


class Regions(models.Model):
    regionId = models.AutoField(db_column='regionId', primary_key=True)  # Field name made lowercase.
    regionNameEn = models.TextField(db_column='regionNameEn')  # Field name made lowercase.
    regionNameRu = models.TextField(db_column='regionNameRu')  # Field name made lowercase.
    regionNameUa = models.TextField(db_column='regionNameUa')  # Field name made lowercase.
    regionFlag = models.TextField(db_column='regionFlag')  # Field name made lowercase.
    countryId = models.ForeignKey(Countries, models.DO_NOTHING, db_column='countryId')  # Field name made lowercase.

    class Meta:
        db_table = 'regions'
