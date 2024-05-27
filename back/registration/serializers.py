import os
import re
from django.conf import settings
from rest_framework import serializers
from .models import *
# from datetime import datetime

class RegionSerializer(serializers.Serializer):
    regionId = serializers.IntegerField()
    regionNameUa = serializers.CharField()
    regionNameEn = serializers.CharField()
    regionNameRu = serializers.CharField()

class CountrySerializer(serializers.Serializer):
    countryId = serializers.IntegerField()
    countryNameUa = serializers.CharField()
    countryNameEn = serializers.CharField()
    countryNameRu = serializers.CharField()


class ClubSerializer(serializers.Serializer):
    clubId = serializers.IntegerField()
    clubName = serializers.CharField()


class CitySerializer(serializers.Serializer):
    cityId = serializers.IntegerField()
    cityName = serializers.CharField()


class OrganizationSerializer(serializers.Serializer):
    orgId = serializers.IntegerField()
    orgName = serializers.CharField()
    orgFlag = serializers.CharField()


class BranchSerializer(serializers.Serializer):
    branchId = serializers.IntegerField()
    branchName = serializers.CharField()


def fetch_all(cursor, datecontrol = ''):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
    # "Return all rows from a cursor as a dict"
    # strDate = str(datecontrol);
    # if len(strDate) == 0:
    #     strDate = datetime.now().strftime('%Y-%m-%d')
    # # arrCheck = strDate.split("-");
    # # print('#1')

    # columns = [col[0] for col in cursor.description]

    # array_of_dict = [
    #     dict(zip(columns, row))
    #     for row in cursor.fetchall()
    # ]

    return array_of_dict


def dict_fetch_all(cursor, datecontrol = ''):
    strDate = str(datecontrol);
    arrCheck = strDate.split("-");
    desc = cursor.description
    array_of_dict = [
            dict(zip([col[0] for col in desc], [str(el) for el in row]))
            for row in cursor.fetchall()
    ]
    dict_to_return = {}
    it = 1
    for item in array_of_dict:
        try:
            birthdate   = item['DateBR'].strip()
            arrBirth    = birthdate.split('-');       
            age         = int(arrCheck[0]) - int(arrBirth[0]) - ((int(arrCheck[1]), int(arrCheck[2])) < (int(arrBirth[1]), int(arrBirth[2])))
            item['Age'] = age             
        except:
            pass
            
        dict_to_return[it] = item
        it += 1

    return dict_to_return

def dict_refery_fetch_all(cursor):
    desc = cursor.description
    array_of_dict = [
            dict(zip([col[0] for col in desc], [str(el) for el in row]))
            for row in cursor.fetchall()
    ]
    dict_to_return = {}
    it = 1
    for item in array_of_dict:
        dict_to_return[it] = item
        it += 1

    return dict_to_return

def tatami_one_fetch(cursor, champType = 0, entity =''):
    desc = cursor.description
    fetch = cursor.fetchall()
    fetched = []
    # print('tatami_one_fetch')

    for row in fetch:
        array_of_dict = dict(zip([col[0] for col in desc], [str(el) for el in row]))

        try:
            fio = fetch[0][0].split(' ')
            # array_of_dict['FIO'] = fio[0] + ' ' + fio[1]
            array_of_dict['FIO'] = fetch[0][0]
        except:
            pass

        try:
            if champType > 0:
                logos_dir = '/assets/media/logos/'
                defaultLogo = 'ak-logo.png'

                regionFlag = array_of_dict['regionFlag'].strip()
                countryFlag = array_of_dict['countryFlag'].strip()
                clubLogo = array_of_dict['ClubLogo'].strip()
                # orgLogo = array_of_dict['OrgLogo'].strip()

                if (champType == 1) :
                    # champType == 1 внутриклубные - nothing
                    logo = None
                elif (champType == 2) :
                    # champType == 2 региональные - bz spravochnika klubov
                    if (clubLogo != '' and clubLogo != 'None') :
                        logo = logos_dir + clubLogo
                    elif (regionFlag != '' and regionFlag != 'None') :
                        logo = logos_dir + regionFlag
                    elif (countryFlag != '' and countryFlag != 'None') :
                        logo = logos_dir + countryFlag
                    else:
                        logo = logos_dir + defaultLogo
                elif (champType == 3) :
                    # champType == 3 национальные / чемп страны - regionu
                    if (regionFlag != '' and regionFlag != 'None') :
                        logo = logos_dir + regionFlag
                    elif (countryFlag != '' and countryFlag != 'None') :
                        logo = logos_dir + countryFlag
                    else:
                        logo = logos_dir + defaultLogo
                elif (champType == 4) :
                    # champType == 4 международные клубные - bz spravochnika klubov
                    if (clubLogo != '' and clubLogo != 'None') :
                        logo = logos_dir + clubLogo
                    elif (regionFlag != '' and regionFlag != 'None') :
                        logo = logos_dir + regionFlag
                    elif (countryFlag != '' and countryFlag != 'None') :
                        logo = logos_dir + countryFlag
                    else:
                        logo = logos_dir + defaultLogo
                elif (champType == 5) :
                    # champType == 5 международные
                    if (countryFlag != '' and countryFlag != 'None') :
                        logo = logos_dir + countryFlag
                    else :
                        logo = logos_dir + defaultLogo

                array_of_dict['logo'] = logo
        except:
            pass

        try:
            photo = array_of_dict.get('Photo', -1)
            # print(photo)
            # if (photo != -1) :
            #     photos_dir = os.path.join(settings.BASE_DIR,'assets', "media", "athletes_photo")
            #     photoFile = os.path.join(photos_dir, photo)
            #     photoExists = os.path.isfile(photoFile)

            #     print(photoFile)

            #     # TODO: move default photo  default-photo.svg to athletes_photo too
            #     if (photoExists) :
            #         array_of_dict['Photo'] = "/assets/media/athletes_photo/" + photoFile
            #     else :
            #         array_of_dict['Photo'] = "/assets/media/logos/default-photo.svg"
        except:
            pass

        fetched.append(array_of_dict)

    return fetched


def fetch_count_info(cursor):
    dict_sql = {}
    it = 1
    for x in cursor.fetchall():
        dict_sql[it] = {'id': x[0], 'name': x[1], 'count': x[2]}

        if (len(x) > 3) :
            dict_sql[it]['logo'] = x[3]

        it += 1

    return dict_sql

def fetch_categories_info(cursor):
    dict_sql = {}
    it = 1
    for x in cursor.fetchall():
        dict_sql[it] = {'id': x[0], 'weightfrom': x[28], 'weightto' : x[29]}

        it += 1

    return dict_sql

def fetch_clubs_info(cursor):
    dict_sql = {}
    it = 1
    for x in cursor.fetchall():
        dict_sql[it] = {'id': x[0], 'name': x[1], 'logo' : x[2]}

        it += 1

    return dict_sql

def fetch_clubs_all_info(cursor):
    dict_sql = {}
    it = 1
    for x in cursor.fetchall():
        dict_sql[it] = {'id': x[0], 'name': x[1], 'logo' : x[2], 'countryId' : x[3]}

        it += 1

    return dict_sql

def country_fetch(cursor):
    dict_sql = {}
    it = 1
    for x in cursor.fetchall():
        dict_sql[it] = {'id': x[3], 'name': x[1], 'count': x[2], 'kod': x[0]}
        it += 1

    return dict_sql


def fetch_tatami(cursor):
    used_tatami = []
    dict_sql = {}
    cnt = 0
    for x in cursor.fetchall():
        if x[1] not in used_tatami:
            used_tatami.insert(len(used_tatami), x[1])
            cnt += 1
            dict_sql[cnt] = {'tatamiId': x[1], 'categoriesIds': [x[0]]}
        else:
            dict_sql[cnt]['categoriesIds'].insert(len(dict_sql[cnt]['categoriesIds']), x[0])

    return dict_sql


def fetch_tatami_video(cursor):
    desc = cursor.description
    array_of_dict = [
            dict(zip([col[0] for col in desc], [str(el) for el in row]))
            for row in cursor.fetchall()
    ]
    dict_to_return = {}
    it = 1
    for item in array_of_dict:
        dict_to_return[it] = item
        it += 1

    return dict_to_return

def fetch_categories(cursor):
    dict_sql = {}
    cnt = 1

    for x in cursor.fetchall():
        dict_sql[cnt] = {'id': x[0], 'time': x[1], 'tatami': x[2]}
        # dict_sql[cnt] = {'id': x[0], 'time': x[1]}
        # dict_sql[cnt] = x[0]
        cnt += 1

    return dict_sql

def fetch_categories_time(cursor):
    dict_sql = {}
    cnt = 1
    for x in cursor.fetchall():
        dict_sql[cnt] = {'id': x[0], 'time': x[1]}

    # for x in cursor.fetchall():
    #     dict_sql[cnt] = x[0]
        cnt += 1

    return dict_sql

def fetch_categories_solo(cursor):
    dict_sql = []

    for x in cursor.fetchall():
        dict_sql.append(x[0])

    return dict_sql

def fetch_string_of_values(cursor):
    arr_of_values = [str(i) if type(i) == int or type(i) == float else '"' + str(i) + '"' for i in cursor.fetchall()[0]]
    arr_of_values = ['NULL' if x is None or x == '"None"' else x for x in arr_of_values]
    string_of_values = ', '.join(arr_of_values)

    return string_of_values
