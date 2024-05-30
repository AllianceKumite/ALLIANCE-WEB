import json
import jwt
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from rest_framework.authtoken.models import Token
from rest_framework.parsers import JSONParser
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .dynamic_models import CreateDynamicChamp
from .serializers import *
from django.db import connection
from django.core.mail import send_mail
from django.conf import settings
from .models import *
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.authtoken import views as auth_views
from rest_framework.compat import coreapi, coreschema
from rest_framework.schemas import ManualSchema
from rest_framework_jwt.settings import api_settings
from .helpers import *
from management.helpers import *
from apiPost.views import generateTranslations
from django.core.exceptions import ObjectDoesNotExist
from fight.helpers import *
from registration.controller import *
import traceback as tb
from operator import itemgetter, attrgetter

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER


class MyAuthTokenSerializer(serializers.Serializer):
    # email = serializers.EmailField(required=False)
    email = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"})

    def validate(self, data):
        user = None
        email = data.get("email")
        # username = data.get('username')
        password = data.get("password")

        # print(f"email password: '{email}:{password}" )

        if email and password:
            username = None
            u = None

            try:
                u = User.objects.get(email=email)
            except ObjectDoesNotExist:
                pass

            if u is not None:
                username = u.username
            else:
                try:
                    u = User.objects.get(username=email)
                except ObjectDoesNotExist:
                    pass

                if u is not None:
                    username = u.username

            if username is not None and username != "":
                # user = authenticate(username=u.username, password=password)
                # print(f"Trying loggining with '{username}:{password}" )
                user = authenticate(username=username, password=password)

                if user:
                    if not user.is_active:
                        msg = _("User account is disabled.")
                        raise exceptions.ValidationError(msg)
                else:
                    msg = _("Unable to log in with provided credentials.")
                    raise exceptions.ValidationError(msg)
        else:
            msg = _('Must include "email" or "user name" and "password".')
            raise exceptions.ValidationError(msg)

        data["user"] = user
        return data


class MyAuthToken(auth_views.ObtainAuthToken):
    serializer_class = MyAuthTokenSerializer

    if coreapi is not None and coreschema is not None:
        schema = ManualSchema(
            fields=[
                coreapi.Field(
                    name="email",
                    required=True,
                    location="form",
                    schema=coreschema.String(
                        title="Email",
                        description="Valid email for authentication",
                    ),
                ),
                coreapi.Field(
                    name="password",
                    required=True,
                    location="form",
                    schema=coreschema.String(
                        title="Password",
                        description="Valid password for authentication",
                    ),
                ),
            ],
            encoding="application/json",
        )

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)

        return JsonResponse(
            {"token": token.key, "user_id": user.pk, "email": user.email}
        )


@csrf_exempt
def ResetPasswordEmail(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        username = json_string.get("username")
        email = json_string.get("email")
        lng = json_string.get("lng")
        lng = lng.lower() if lng != None else "en"

        user = User.objects.get(email=email, username=username)
        if user is not None:
            subject = "Reset Password"
            # TODO: Do not hardcode langs here
            if lng == "ua":
                msg = f"Вітання, {username}. Щоб переустановити пароль перейдіть по зсилці <a href='http://{settings.APP_ADDRESS}:{settings.APP_PORT}/forgot-password-reset?username={username}&email={email}'>link</a>."
            elif lng == "ru":
                msg = f"Здраствуйте, {username}. Чтоб переустановить пароль перейдите по ссылке <a href='http://{settings.APP_ADDRESS}:{settings.APP_PORT}/forgot-password-reset?username={username}&email={email}'>link</a>."
            else:
                msg = f"Hello, {username} to reset password you need to follow this <a href='http://{settings.APP_ADDRESS}:{settings.APP_PORT}/forgot-password-reset?username={username}&email={email}'>link</a>."

            to = email
            res = send_mail(subject, msg, settings.APP_EMAIL, [to], html_message=msg)

            return HttpResponse(status=200) if res == 1 else HttpResponse(status=400)
        return HttpResponse(status=400)


@csrf_exempt
def ResetPassword(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        username = json_string.get("username")
        email = json_string.get("email")
        new_password = json_string.get("password")

        user = User.objects.get(email=email, username=username)
        if user is not None:
            user.set_password(new_password)
            user.save()
            return HttpResponse(status=200)
        return HttpResponse(status=400)


@csrf_exempt
def CreateChampView(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)

        title2 = title.replace(" ", "_")
        title2 = title2.lower()
        try:
            new_champ = CreateDynamicChamp(title=title2)
            new_champ.create_club()
            new_champ.create_champ()
            new_champ.create_coach()
            new_champ.create_ath_champ()
            new_champ.create_category()
            new_champ.create_tatami()
            new_champ.create_refery()
            new_champ.create_kata()
            new_champ.create_katagroup()
            cursor = connection.cursor()

            query = (
                "INSERT INTO champs (title, actualTime, typeCheckCircle) "
                + f'VALUES ("{title2}", 0, 0)'
            )

            cursor.execute(query)
        except Exception as e:
            print(str(e)
                + "\n\r"
                + "".join(tb.format_exception(None, e, e.__traceback__)))
            return HttpResponse(
                str(e)
                + "\n\r"
                + "".join(tb.format_exception(None, e, e.__traceback__)),
                status=400,
            )

        generateTranslations()

    return HttpResponse(status=201)


@csrf_exempt
def DeleteChampView(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)

        title = title.replace(" ", "_")
        # TODO: deletion doesnt work ahora porque depentent tables fail
        try:
            cursor = connection.cursor()
            try:
                cursor.execute("DROP TABLE " + f"{title}_athchamp")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_category")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_champ")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_club")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_coach")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_kata")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_katagroup")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_refery")
            except Exception as e:
                print('EXCEPTION: ', e)
            try:
                cursor.execute("DROP TABLE " + f"{title}_tatami")
            except Exception as e:
                print('EXCEPTION: ', e)
            cursor.execute('DELETE FROM champs WHERE title = "' + title + '"')
        except Exception as e:
            print('EXCEPTION: ', e)

    return HttpResponse(status=200)


@csrf_exempt
def GetTatamiAll(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)

        title = title.replace(" ", "_")
        # try:
        tatamisCount = getTatamisCount(title)

        return JsonResponse({"tatamisCount": tatamisCount}, status=200)
        # except Exception as e:
        #     print('EXCEPTION: ', e)
        #     return HttpResponse(status=400)

    return HttpResponse(status=200)


@csrf_exempt
def GetTimesByTatamiRequest(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")

        if title is None:
            return HttpResponse(status=400)

        title = title.replace(" ", "_")

        times = getTimesByTatami(title)

        return JsonResponse(times, safe=False, status=200)
        # except:
        #     return HttpResponse(status=400)

    return HttpResponse(status=200)


@csrf_exempt
def GetOnlineTatamiFights(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        tatami = json_string.get("tatami")

        if (title is None) or (tatami is None):
            return HttpResponse(status=400)

        title = title.replace(" ", "_")
        # try:

        champType = getChampType(title)

        fights = getCurrentAndAllNextFightsWithParticipants(
            title, champType, tatami, 7
        )

        return JsonResponse(fights, safe=False, status=200)
        # except:
        #     return HttpResponse(status=400)

    return HttpResponse(status=200)


@csrf_exempt
def GetOnlineAllTatamisFights(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        startingTatamiId = json_string.get("startingTatamiId")
        tatamisAmountToFetch = json_string.get("tatamisAmount")

        # print("============= GetOnlineAllTatamisFights =============")
        # print("startingTatamiId")
        # print(startingTatamiId)
        # print("tatamisAmountToFetch")
        # print(tatamisAmountToFetch)

        if title is None:
            return HttpResponse(status=400)

        title = title.replace(" ", "_")
        # try:
        champType = getChampType(title)
        tatamisCount = getTatamisCount(title)

        allTatamisFights = []
        tatami = startingTatamiId if startingTatamiId <= tatamisCount else 1
        fetchedTatamis = 0
        tatamisCycled = 0

        while (
            fetchedTatamis < tatamisAmountToFetch
            and tatami <= tatamisCount
            or fetchedTatamis == 0
        ) and (tatamisCycled < tatamisCount):
            fights = getCurrentAndAllNextFightsWithParticipants(
                title, champType, tatami, 7
            )

            tatamisCycled = tatamisCycled + 1

            if len(fights) > 0:
                allTatamisFights.append({"fights": fights, "tatamiId": tatami})

                fetchedTatamis = fetchedTatamis + 1

            if (
                fetchedTatamis == 0
                and tatamisCycled < tatamisCount
                and tatami == tatamisCount
            ):
                tatami = 0

            tatami = tatami + 1  # if tatami < tatamisCount else 1

        return JsonResponse(allTatamisFights, status=200, safe=False)

        # except:
        #     return HttpResponse(status=400)

    return HttpResponse(status=200)


# @csrf_exempt
# def _GetCurrentChampAbout(request):
#     if request.method == 'POST':
#         json_string = JSONParser().parse(request)
#
#         if ((title := json_string.get('title')) is not None) and ((table := json_string.get('table')) is not None):
#             if table not in ('about', 'athletes', 'category', 'champ', 'club', 'coach', 'tatami'):
#                 return HttpResponse(status=400)
#
#             try:
#                 title = title.replace(" ", "_")
#                 cursor = connection.cursor()
#                 cursor.execute(query_to_receive_data[table] + title.lower() + '_' + table)
#                 data_to_return = dict_fetch_all(cursor)
#             except:
#                 return HttpResponse(status=400)
#
#         else:
#             return HttpResponse(status=400)
#
#         return JsonResponse(data_to_return, status=200)
#
#     return HttpResponse(status=200)


@csrf_exempt
def GetParticipantsRequest(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        coachId = json_string.get("coach")
        clubId = json_string.get("club")
        regionId = json_string.get("region")
        countryId = json_string.get("country")
        categoryId = json_string.get("category")

        if title is None:
            return HttpResponse(status=400)

        try:
            title = title.replace(" ", "_")

            responseObject = getParticipants(
                title,
                coachId=coachId,
                clubId=clubId,
                regionId=regionId,
                countryId=countryId,
                categoryId=categoryId,
            )

            if coachId:
                coach = getCoachInfo(title, coachId)
                responseObject["filter"] = coach["CoachName"]
            if clubId:
                club = getClubInfo(title, clubId)
                responseObject["filter"] = club["ClubName"]

        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse(responseObject, status=200, safe=True)

    return HttpResponse(status=200)

@csrf_exempt
def GetParticipantsCount(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        # print(json_string)
        title = json_string.get("title")
        # print('GetParticipantsCount')
        # print(title)
        if title is None:
            return HttpResponse(status=400)

        try:
            title = title.replace(" ", "_")
            cursor = connection.cursor()
            query = f'SELECT Count(*) FROM {title}_athchamp'
            # print(query)
            cursor.execute(query)
            hasPlace = cursor.fetchall()[0][0]
            # print('count=',hasPlace)

        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse({'count': hasPlace}, status=200, safe=True)

    return HttpResponse(status=200)

@csrf_exempt
def GetReferysRequest(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")

        # print(title)
        # coachId = json_string.get("coach")
        # clubId = json_string.get("club")
        # regionId = json_string.get("region")
        # countryId = json_string.get("country")
        # categoryId = json_string.get("category")

        # if title is None:
        #     return HttpResponse(status=400)

        try:
            responseObject = getReferys(
                title,
            )

        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse(responseObject, status=200, safe=True)

    return HttpResponse(status=200)


@csrf_exempt
def GetNextFightByCoach(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        coachId = json_string.get('coachid')
        time = json_string.get('time')

        print(time)

        if title is None:
            return HttpResponse(status=400)

        try:
            responseObject = getFightByCoach(
                title, coachId, time
            )

        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse(responseObject, status=200, safe=True)

    return HttpResponse(status=200)

@csrf_exempt
def GetNextFightByClub(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        clubId = json_string.get('clubid')
        time = json_string.get('time')

        if title is None:
            return HttpResponse(status=400)

        try:
            responseObject = getFightByClub(
                title, clubId, time
            )

        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse(responseObject, status=200, safe=True)

    return HttpResponse(status=200)


@csrf_exempt
def GetReferysCoachRequest(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        coachId = json_string.get('coachId')

        # print(coachId)
        
        if title is None:
            return HttpResponse(status=400)

        try:
            responseObject = getReferysCoach(
                title, coachId
            )

        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse(responseObject, status=200, safe=True)

    return HttpResponse(status=200)

@csrf_exempt
# GetTatami
def GetTatamiCurrentFightAndAllCategories(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")

        if title is None:
            return HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_")

        champType = getChampType(title)

        tatamisCategories = getTatamisCategories(title)

        for tatamiId in tatamisCategories:
            currentFight = None
            totalDuel = getTatamisTotalDuel(title, tatamiId)
            cntDuelUpToSemi = getTatamisUpToSemiDuel(title, tatamiId)
            cntDuelSemiFinalFinal = getTatamisSemiFinalFinalDuel(title, tatamiId)
            # print('tatami', tatamiId, '=', totalDuel, cntDuelUpToSemi, cntDuelSemiFinalFinal)
            currentFightDetails = getCurrentFight(
                title, champType, tatamiId, None, None
            )

            tatamisCategories[tatamiId]["total"] = totalDuel
            tatamisCategories[tatamiId]["upsemi"] = cntDuelUpToSemi
            tatamisCategories[tatamiId]["semi_final"] = cntDuelSemiFinalFinal
            if currentFightDetails != None:
                currentFightDetails["total"] = getTatamiFightsCount(
                    title, champType, tatamiId
                )

                currentFight = {
                    "details": currentFightDetails,
                    "red": getParticipantInfo(
                        title, champType, currentFightDetails["AthIdRed"]
                    ),
                    "white": getParticipantInfo(
                        title, champType, currentFightDetails["AthIdWhite"]
                    ),
                }

                tatamisCategories[tatamiId]["fight"] = currentFight

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(tatamisCategories, status=200)

    return HttpResponse(status=200)

@csrf_exempt
# GetTatami
def GetTatamiCurrentFightByTimeAndAllCategories(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        time = json_string.get("time")

        if title is None:
            return HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_")

        champType = getChampType(title)

        print(title)
        print(time)
        tatamisCategories = getTatamisCategoriesByTime(title, time)

        for tatamiId in tatamisCategories:
            currentFight = None
            # totalDuel = getTatamisTotalDuel(title, tatamiId)
            totalDuel = getTatamisTotalDuelTime(title, tatamiId, time)
            cntDuelUpToSemi = getTatamisUpToSemiDuel(title, tatamiId)
            cntDuelSemiFinalFinal = getTatamisSemiFinalFinalDuel(title, tatamiId)
            # print('tatami', tatamiId, '=', totalDuel, cntDuelUpToSemi, cntDuelSemiFinalFinal)
            currentFightDetails = getCurrentFight(
                title, champType, tatamiId, None, None
            )

            tatamisCategories[tatamiId]["total"] = totalDuel
            tatamisCategories[tatamiId]["upsemi"] = cntDuelUpToSemi
            tatamisCategories[tatamiId]["semi_final"] = cntDuelSemiFinalFinal
            if currentFightDetails != None:
                currentFightDetails["total"] = getTatamiFightsCount(
                    title, champType, tatamiId
                )

                currentFight = {
                    "details": currentFightDetails,
                    "red": getParticipantInfo(
                        title, champType, currentFightDetails["AthIdRed"]
                    ),
                    "white": getParticipantInfo(
                        title, champType, currentFightDetails["AthIdWhite"]
                    ),
                }

                tatamisCategories[tatamiId]["fight"] = currentFight

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(tatamisCategories, status=200)

    return HttpResponse(status=200)

@csrf_exempt
# GetTatami
def GetTatamiUrlVideo(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")

        if title is None:
            return HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_")

        cursor = connection.cursor()

        try:
            query = "SELECT DISTINCT id, url FROM " + title + "_tatami" + " ORDER BY id"
            cursor.execute(query)
            tatamiurl = fetch_tatami_video(cursor)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

        return JsonResponse(tatamiurl, status=200, safe=True)

    return HttpResponse(status=200)

def create_champ_virtual(title, addname):
    cursor = connection.cursor()
    if(len(addname) > 0):
        cursor.execute('CREATE TABLE ' + title + '_champ_' + addname + '( ' +
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
    else:
        cursor.execute('CREATE TABLE ' + title + '_champ ' + '( ' +
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

def select_data_virtual(title, level):
    cursor = connection.cursor()
    query = (f'INSERT INTO {title}_champ ' +
    f'(SELECT * FROM {title}_champ_main where Level >= {level})'
    )
    print('select_data_virtual', query)

    cursor.execute(query)

def rename_table_champ(title):
    cursor = connection.cursor()
    try:
        query = (f'DELETE TABLE {title}_champ_main')
        cursor.execute(query)
    except Exception as e:
        print(e)
    query = (f'RENAME TABLE {title}_champ TO {title}_champ_main')
    print('rename_table_champ', query)
    cursor.execute(query)

@csrf_exempt
def CreateCopyChampData(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        try:
            create_champ_virtual(title, 'copy')
        except Exception as e:
            print(e)
        cursor = connection.cursor()
        query = (f'INSERT INTO {title}_champ_copy ' +
        f'(SELECT * FROM {title}_champ)'
        )
        cursor.execute(query)
    return HttpResponse(status=200)

@csrf_exempt
def SelectByLevelAndCreateTable(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        level = json_string.get("level")

        try:
            rename_table_champ(title)
            create_champ_virtual(title, '')
        except Exception as e:
            print(e)

        print('table created')
        select_data_virtual(title, level)
        # cursor = connection.cursor()
        # for arr_of_values in data:
        #     if len(arr_of_values) > 0:
        #         tatamiId = arr_of_values["tatamiId"]
        #         categoriesIds = arr_of_values["categoriesIds"]
        #         # print('tatami=', tatamiId, 'categoriesIds=', categoriesIds)
        #         for categoryId in categoriesIds:
        #             query = (
        #                 f"UPDATE "
        #                 + title
        #                 + "_champ"
        #                 + f' SET TatamiId = "{tatamiId}"'
        #                 + f" WHERE CategoryId = {categoryId}"
        #             )
        #             cursor.execute(query)
        # # print(renumber)
        # if renumber:
        #     renumberFights(title, len(data))
        # if title is None:
        #     return HttpResponse(status=400)
    return HttpResponse(status=200)

@csrf_exempt
def SetTatamiCategory(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        data = json_string.get("data")
        renumber = json_string.get("renumber")
        cursor = connection.cursor()
        for arr_of_values in data:
            if len(arr_of_values) > 0:
                tatamiId = arr_of_values["tatamiId"]
                categoriesIds = arr_of_values["categoriesIds"]
                # print('tatami=', tatamiId, 'categoriesIds=', categoriesIds)
                for categoryId in categoriesIds:
                    query = (
                        f"UPDATE "
                        + title
                        + "_champ"
                        + f' SET TatamiId = "{tatamiId}"'
                        + f" WHERE CategoryId = {categoryId}"
                    )
                    cursor.execute(query)
        # print(renumber)
        if renumber:
            renumberFights(title, len(data))
        if title is None:
            return HttpResponse(status=400)
    return HttpResponse(status=200)


# Нумерация поединков идет для каждого времени турнира в пределах татами
# Выбираем все татами по конкретному времени.
# Затем в пределах каждого татами выполняем нумерацию поединков. Обязательно
# учитываем блоки. Если в парах первого круга(level=0) AthId = -1 - то номер
# поединка равен 0!


def renumberFights(title, tatamicount):
    cursorTime = connection.cursor()
    query = "SELECT DISTINCT Time FROM " + title + "_category"
    cursorTime.execute(query)
    for row in cursorTime.fetchall():
        time = row[0]
        cursorcategory = connection.cursor()
        cursorupdate = connection.cursor()
        for i in range(tatamicount):
            query = f"SELECT * FROM {title}_champ WHERE EXISTS (SELECT * FROM {title}_category WHERE {title}_champ.CategoryId = {title}_category.categoryId AND {title}_category.Time = {time}) and TatamiId = { i + 1 } order by Level, CategoryId, LevePair, NumPair"
            cursorcategory.execute(query)
            numberDuel = 1
            for arr_of_values in cursorcategory.fetchall():
                query = ""
                athRed = int(arr_of_values[4])
                athWhite = int(arr_of_values[5])
                level = int(arr_of_values[11])
                place1 = int(arr_of_values[12])
                place3 = int(arr_of_values[13])
                UpDuelRed = int(arr_of_values[18])
                # LevelPair = int(arr_of_values[16])
                UpDuelWhite = int(arr_of_values[19])
                DuelIsPlace = int(arr_of_values[8])

                # noDuel = (athRed <= 0 and athWhite <= 0) and (level == 7)
                # noDuel = (athRed > 0 and athWhite < 0 and DuelIsPlace == 1)
                # if not noDuel:
                #     noDuel = (athRed < 0 and athWhite < 0 and DuelIsPlace == 1) 
                noDuel = (athRed < 0 or athWhite < 0) and (UpDuelRed < 0 and UpDuelWhite <= 0 and DuelIsPlace == 1)
                # noDuel = DuelIsPlace
                noDuel = (athRed <= 0 or athWhite <= 0) and (level <= 8 and DuelIsPlace == 1)
                final = (athRed <= 0 or athWhite <= 0) and (level == 12)
                final3 = (
                    (athRed <= 0 or athWhite <= 0) and (level == 8) and (place3 == 1)
                )
                final1 = (
                    (athRed <= 0 or athWhite <= 0) and (level == 12) and (place1 == 1)
                )
                if noDuel:
                    query = f"UPDATE {title}_champ SET NumDuel = 0 where ownId = {arr_of_values[0]}"
                elif final:
                    if final3:
                        query = f"UPDATE {title}_champ SET NumDuel = {numberDuel} where ownId = {arr_of_values[0]}"
                        numberDuel = numberDuel + 1
                    else:
                        # нет поединка за 3-е место
                        query = f"UPDATE {title}_champ SET NumDuel = 0 where ownId = {arr_of_values[0]}"
                    if final1:
                        query = f"UPDATE {title}_champ SET NumDuel = {numberDuel} where ownId = {arr_of_values[0]}"
                        numberDuel = numberDuel + 1
                else:
                    query = f"UPDATE {title}_champ SET NumDuel = {numberDuel} where ownId = {arr_of_values[0]}"
                    numberDuel = numberDuel + 1
                if len(query) > 0:
                    cursorupdate.execute(query)

    # увязываем поединки между собой в пределах категории - nextDuel, UpDuelRed, UpDuelWhite
    # выбираем уникальные времена
    cursorTime = connection.cursor()
    query = "SELECT DISTINCT Time FROM " + title + "_category"
    cursorTime.execute(query)
    cursorcategory = connection.cursor()
    cursorcurrDuel = connection.cursor()
    cursornextDuel = connection.cursor()
    cursorUpdate = connection.cursor()
    cursorLevel = connection.cursor()
    arrLevel = []
    # query = f"SELECT DISTINCT CategoryId FROM {title}_champ  order by CategoryId"
    query = f"SELECT CategoryId, CategoryType FROM {title}_category  order by CategoryId"
    cursorcategory.execute(query)
    for row in cursorcategory.fetchall():
        categoryId = row[0]
        categoryType = int(row[1])
        
        if categoryType != 0: #не олимпийская
            continue

        # выбираем все записи конкретного татами        
        query = f"SELECT DISTINCT Level FROM {title}_champ WHERE {title}_champ.CategoryId = {categoryId} order by Level"
        cursorLevel.execute(query)
        arrLevel.clear()
        for currRow in cursorLevel.fetchall():
            arrLevel.append(int(currRow[0]))

        print(arrLevel)
        query = f"SELECT * FROM {title}_champ WHERE CategoryId = {categoryId} order by Level, CategoryId, LevePair, NumPair"
        cursorcurrDuel.execute(query)
        for currRow in cursorcurrDuel.fetchall():
            currOwnId = int(currRow[0])
            currlevel = int(currRow[11])
            currNumPair = int(currRow[17])
            currNumDuel = (currRow[6])

            numNextlevel = -1
            
            if currlevel < 7:
                for i in range(len(arrLevel)):
                    
                    if currlevel == arrLevel[i]:
                        if i + 1 < len(arrLevel):
                            numNextlevel = int(arrLevel[i + 1])
                            break

            numPairNext = currNumPair // 2 # Номер пары в следующем уровне
            
            bEven = currNumPair % 2 # если true - это ака
            print(numNextlevel)
            if numNextlevel == 12 or numNextlevel == 8:  #это финальные поединки 3-е и 1-е место
                nextNumDuel = -1
                numPairNext = currNumPair
                bEven       = numPairNext
                numPairNext = 1
            if currlevel < 7:
                query = f"SELECT *  FROM {title}_champ WHERE CategoryId = {categoryId} and Level = {numNextlevel} and NumPair = {numPairNext} order by Level, CategoryId, LevePair, NumPair"
                cursornextDuel.execute(query)
                nextRow = cursornextDuel.fetchone()
                if nextRow is not None:
                    nextOwnId = nextRow[0]
                    nextNumDuel = nextRow[6]
                    # if numNextlevel != 12 and numNextlevel != 8:
                    if bEven == 0:
                        query = f"UPDATE {title}_champ SET UpDuelRed = {currNumDuel} where ownId = {nextOwnId}"
                        cursorUpdate.execute(query)
                    if bEven == 1:
                        query = f"UPDATE {title}_champ SET UpDuelWhite = {currNumDuel} where ownId = {nextOwnId}"
                        cursorUpdate.execute(query)
                    # else:
                    #     query = f"SELECT *  FROM {title}_champ WHERE CategoryId = {categoryId} and Level = {numNextlevel} order by Level, CategoryId, LevePair, NumPair"
                    #     cursornextDuel.execute(query)
                    #     for nextItem in cursornextDuel.fetchall():
                    #         if numPairNext == 0:
                    #             query = f"UPDATE {title}_champ SET UpDuelRed = {currNumDuel} where ownId = {nextItem[0]}"
                    #         if numPairNext == 1:
                    #             query = f"UPDATE {title}_champ SET UpDuelWhite = {currNumDuel} where ownId = {nextItem[0]}"
                    #         cursornextDuel.execute(query)

                else:
                    nextNumDuel = -1
                query = f"UPDATE {title}_champ SET NextDuel = {nextNumDuel} where ownId = {currOwnId}"
                cursorUpdate.execute(query)
            else:
                if currlevel == 7:
                    query = f"SELECT *  FROM {title}_champ WHERE CategoryId = {categoryId} and Level = 8 order by Level, CategoryId, LevePair, NumPair"
                    cursornextDuel.execute(query)
                    nextRow = cursornextDuel.fetchone()
                    if nextRow is not None:
                        nextOwnId = nextRow[0]
                        nextNumDuel = nextRow[6]
                        print('level=8 ', nextNumDuel)
                        is3place = nextRow[13]
                        # if numNextlevel != 12 and numNextlevel != 8:
                        if is3place:
                            if bEven == 0:
                                query = f"UPDATE {title}_champ SET UpDuelRed = {currNumDuel} where ownId = {nextOwnId}"
                                cursorUpdate.execute(query)
                            if bEven == 1:
                                query = f"UPDATE {title}_champ SET UpDuelWhite = {currNumDuel} where ownId = {nextOwnId}"
                                cursorUpdate.execute(query)
                        else:
                            query = f"UPDATE {title}_champ SET UpDuelRed = -1 where ownId = {nextOwnId}"
                            cursorUpdate.execute(query)
                            query = f"UPDATE {title}_champ SET UpDuelWhite = -1 where ownId = {nextOwnId}"
                            cursorUpdate.execute(query)
                    query = f"UPDATE {title}_champ SET NextDuel = {nextNumDuel} where ownId = {currOwnId}"
                    cursorUpdate.execute(query)
            

                    query = f"SELECT *  FROM {title}_champ WHERE CategoryId = {categoryId} and Level = 12 order by Level, CategoryId, LevePair, NumPair"
                    cursornextDuel.execute(query)

                    nextRow = cursornextDuel.fetchone()
                    if nextRow is not None:
                        nextOwnId = nextRow[0]
                        nextNumDuel = nextRow[6]
                        print('level=12 ', nextNumDuel)
                        # if numNextlevel != 12 and numNextlevel != 8:
                        if bEven == 0:
                            query = f"UPDATE {title}_champ SET UpDuelRed = {currNumDuel} where ownId = {nextOwnId}"
                            cursorUpdate.execute(query)
                        if bEven == 1:
                            query = f"UPDATE {title}_champ SET UpDuelWhite = {currNumDuel} where ownId = {nextOwnId}"
                            cursorUpdate.execute(query)
                    query = f"UPDATE {title}_champ SET NextDuel = {nextNumDuel} where ownId = {currOwnId}"
                    cursorUpdate.execute(query)

                if currlevel == 8 or currlevel == 12:
                    nextNumDuel = -1
                    query = f"UPDATE {title}_champ SET NextDuel = {nextNumDuel} where ownId = {currOwnId}"
                    cursorUpdate.execute(query)
    return

@csrf_exempt
# Sholed becalled
def GetTatamisCurrentFight(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        tatami = json_string.get("tatami")
        time = json_string.get("time")
        category = json_string.get("category")
        if title is None:
            return HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_")

        tatamisCurrentFight = getCurrentFightForTatamisTimeAndCategory(
            title, tatami=tatami, time=time, category=category
        )

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(tatamisCurrentFight, status=200)

    return HttpResponse(status=200)


@csrf_exempt
def GetCountriesDynamic(request):
    # print("===================")
    if True or request.method == "POST":
        # print("-3 ===================")
        title = None
        selectAll = None

        try:
            json_string = JSONParser().parse(request)
            title = json_string.get("title")
            selectAll = json_string.get("all", True)
        except:
            pass

        # if all(i is None for i in [title]):
        #     return HttpResponse(status=400)
        try:
            # print("1 ===================")

            if title is not None:
                title = title.replace(" ", "_")

            cursor = connection.cursor()

            query = "SELECT countries.countryId AS id, countries.countryFlag, countries.countryKod "

            if not selectAll and title is not None and title != "":
                query += ", COUNT(" + title + "_athchamp.athId) AS count "

            query += "FROM countries "

            if not selectAll and title is not None and title != "":
                query += (
                    "JOIN "
                    + title
                    + "_athchamp "
                    + "ON countries.CountryId = "
                    + title
                    + "_athchamp.countryId "
                    + "GROUP BY countries.CountryId, "
                    + title
                    + "_athchamp.countryId"
                )

            # print('==========================')
            # print(query)

            cursor.execute(query)

            data_to_return = tatami_one_fetch(cursor, 5)

            # print(data_to_return)

            # country_fetch(cursor)
        except:
            return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200, safe=False)

    return HttpResponse(status=200)


@csrf_exempt
def GetTypeChamp(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)

        title = title.replace(" ", "_")
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT champType FROM champs WHERE title = '" + title + "'")
            data = cursor.fetchall()
            data = data[0] if len(data) > 0 else []
            data = data[0] if len(data) > 0 else None
            data = {"type": data}
        except:
            return HttpResponse(status=400)

        return JsonResponse(data, status=200)

    return HttpResponse(status=200)


# unused
@csrf_exempt
def GetRegionsDynamic(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)
        try:
            title = title.replace(" ", "_")
            cursor = connection.cursor()
            cursor.execute(
                "SELECT "
                + "regions.RegionId, "
                +
                # 'regions.RegionName' + lng + ', ' +
                "COUNT("
                + title
                + "_athchamp.ownId) "
                + "FROM regions join "
                + title
                + "_athchamp "
                + "ON regions.RegionId = "
                + title
                + "_athchamp.RegionId "
                + "GROUP BY regions.RegionId, "
                + title
                + "_athchamp.RegionId"
            )

            # TODO: ? Didnt worked where is it used?
            data_to_return = fetch_count_info(cursor)
        except:
            return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)


@csrf_exempt
def GetCategoryDynamic(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)
        try:
            title = title.replace(" ", "_")
            cursor = connection.cursor()
            # query = "SELECT "
            # + title 
            # + "_category.categoryId,"
            # + title + "_category.Time,"
            # + " TatamiId " 
            # + " FROM " + title + "_champ"
            # + " JOIN "
            # + title + "_category" 
            # + " ON "
            # + title + "_champ.CategoryId = " 
            # + title + "_category.CategoryId"
            # + " GROUP BY " + title +"_category.categoryId," 
            # + title + "_category.Time,"
            # + "TatamiId ORDER BY TatamiId, Time"
            # query = "SELECT "
            # + title 
            # + "_category.categoryId,"
            # + title + "_category.Time,"
            # + " TatamiId " 
            # + " FROM " + title + "_champ"
            # query = "SELECT " + title + "_category.categoryId," + title + "_category.Time, TatamiId"
            # + " FROM " + title + "_champ"
            # query = f"SELECT {title}_category.categoryId, {title}_category.Time, TatamiId FROM {title}_champ JOIN {title}_category ON {title}_champ.categoryId = {title}_category.categoryId  ORDER BY TatamiId, Time"
            query = f"SELECT {title}_category.categoryId, {title}_category.Time, TatamiId FROM {title}_champ JOIN {title}_category ON {title}_champ.CategoryId = {title}_category.CategoryId GROUP BY {title}_category.categoryId, {title}_category.Time, TatamiId ORDER BY categoryId"

            # print(query)
            cursor.execute(query)

            # cursor.execute(
            #     "SELECT " + title + "_category.categoryId, " + title + "_category.Time "
            #     " FROM " + title + "_category"
            # )
            if(cursor.rowcount == 0):
                query = f"SELECT {title}_category.categoryId, {title}_category.Time, {title}_category.Time FROM {title}_category  ORDER BY {title}_category.categoryId"
                # print(query)
                cursor.execute(query)

            data_to_return = fetch_categories(cursor)
        except:
            return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)

def GetCategoryTimeDynamic(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)
        try:
            title = title.replace(" ", "_")
            cursor = connection.cursor()
            cursor.execute(
                "SELECT " + title + "_category.categoryId, " + title + "_category.Time "
                " FROM " + title + "_category"
            )
            data_to_return = fetch_categories(cursor)
        except:
            return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)

@csrf_exempt
def getCoaches(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)
        try:
            title = title.replace(" ", "_")
            cursor = connection.cursor()

            cursor.execute(
                "SELECT "
                + title
                + "_coach.coachId, "
                + title
                + "_coach.coachName, "
                + "COUNT("
                + title
                + "_athchamp.ownId) "
                + "FROM "
                + title
                + "_coach join "
                + title
                + "_athchamp "
                + "ON "
                + title
                + "_coach.CoachId = "
                + title
                + "_athchamp.CoachId "
                + "GROUP BY "
                + title
                + "_coach.coachId, "
                + title
                + "_coach.coachName"
            )

            data_to_return = fetch_count_info(cursor)

        except:
            return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)


@csrf_exempt
def GetClubsDynamic(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_")
        cursor = connection.cursor()
        cursor.execute(
            "SELECT "
            + title
            + "_club.clubId, "
            + title
            + "_club.clubName, "
            + "COUNT("
            + title
            + "_athchamp.ownId), "
            + title
            + "_club.clubLogo "
            + "FROM "
            + title
            + "_club "
            + "JOIN "
            + title
            + "_athchamp "
            + "ON "
            + title
            + "_club.clubId = "
            + title
            + "_athchamp.clubId "
            + "GROUP BY "
            + title
            + "_club.clubId, "
            + title
            + "_club.clubName, "
            + title
            + "_club.clubLogo"
        )

        data_to_return = fetch_count_info(cursor)

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)

@csrf_exempt
def GetCategories(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        if title is None:
            return HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_")
        cursor = connection.cursor()
        cursor.execute(
            "SELECT * FROM " + title + "_category ORDER BY categoryId"
        )
        # print('api-champ-get-categories')
        data_to_return = dict_fetch_all(cursor)

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)

@csrf_exempt
def GetAllClubsDynamic(request):
    if request.method == "POST":
        # json_string = JSONParser().parse(request)

        # title = json_string.get("title")
        # title = title.replace(" ", "_")
        
        # try:
        cursor = connection.cursor()
        # query = (
        #         "SELECT clubId, clubName, clubLogo FROM clubs"
        #     )
        query = (
        "SELECT clubId, clubName, clubLogo FROM clubs order by clubId"
        )
        cursor.execute(query)
        data_to_return = fetch_clubs_info(cursor)

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)

    return HttpResponse(status=200)

# GetCategorySVG unused TODO: remove
@csrf_exempt
def GetCategorySVG(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        lng = json_string.get("lng", "ua")
        cat_title = json_string.get("catTitle")
        if all(i is None for i in [cat_title, lng, title]):
            return HttpResponse(status=400)
        try:
            cursor = connection.cursor()

            query = (
                "SELECT CategorySVG FROM "
                + title
                + "_category WHERE CategoryName"
                + lng
                + ' = "'
                + cat_title
                + '"'
            )

            cursor.execute(query)
            url = cursor.fetchall()

            data_to_return = {"url": url[0] if (len(url) > 0) else ""}
        except:
            HttpResponse(status=400)
    return JsonResponse(data_to_return, status=200)


@csrf_exempt
def getDataForDrawByCategories(request):
    fights = []
    category = {}

    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        categoryId = json_string.get("catTitle")

        if all(i is None for i in [categoryId, title]):
            return HttpResponse(status=400)

        category = getCategoryInfo(title, categoryId)
        # print(category)
        if category != None:
            champType = getChampType(title)
            # print(champType)
            fights = getCategoryFightsWithParticipants(
                title, champType, categoryId, category["CategoryType"]
            )
        else:
            category = {"CategoryId": categoryId}

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(
        {"fights": fights, "category": category}, status=200, safe=False
    )


@csrf_exempt
def getIndividualResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        tatami = json_string.get("tatami")
        time = json_string.get("time")

        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        categoriesResults = []

        tatamiFilter = f"tatamiId = {tatami}" if tatami is not None else "TRUE"
        timeFilter = f"A.Time = {time}" if time is not None else "TRUE"

        cursor = connection.cursor()
        query = (
            f"SELECT * FROM {title}_category as A "
            + f"JOIN (SELECT DISTINCT tatamiId, CategoryId FROM {title}_champ as B WHERE {tatamiFilter}) C ON A.categoryId = C.CategoryId "
            f"WHERE {timeFilter} "
            "ORDER BY C.tatamiId, A.Time"
        )

        cursor.execute(query)

        categoriesDetails = tatami_one_fetch(cursor, None)

        if categoriesDetails:
            for categoryDetails in categoriesDetails:
                places = []

                firstPlace = getParticipantInfo(
                    title, champType, categoryDetails["idxAth1Place"]
                )

                if firstPlace:
                    firstPlace["place"] = 1
                    # firstPlace.pop("OrdNum", None)
                    places.append(firstPlace)

                secondPlace = getParticipantInfo(
                    title, champType, categoryDetails["idxAth2Place"]
                )

                if secondPlace:
                    secondPlace["place"] = 2
                    # secondPlace.pop("OrdNum", None)
                    places.append(secondPlace)

                thirdPlace = getParticipantInfo(
                    title, champType, categoryDetails["idxAth3Place"]
                )

                if thirdPlace:
                    thirdPlace["place"] = 3
                    # thirdPlace.pop("OrdNum", None)
                    places.append(thirdPlace)

                # if categoryDetails["Category3Place"] == "0":
                    oneMoreThirdPlace = getParticipantInfo(
                        title, champType, categoryDetails["idxAth4Place"]
                    )

                    if oneMoreThirdPlace:
                        oneMoreThirdPlace["place"] = (
                            3 if categoryDetails["Category3Place"] == "0" else 4
                        )
                        # oneMoreThirdPlace.pop("OrdNum", None)
                        places.append(oneMoreThirdPlace)

                categoriesResults.append(
                    {"category": categoryDetails, "places": places}
                )

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(categoriesResults, status=200, safe=False)


@csrf_exempt
def getIndividualResultsByClub(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)
        title = json_string.get("title")
        tatami = json_string.get("tatami")
        time = json_string.get("time")

        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        categoriesResults = []

        tatamiFilter = f"tatamiId = {tatami}" if tatami is not None else "TRUE"
        timeFilter = f"A.Time = {time}" if time is not None else "TRUE"

        cursor = connection.cursor()
        query = (
            f"SELECT * FROM {title}_category as A "
            + f"JOIN (SELECT DISTINCT tatamiId, CategoryId FROM {title}_champ as B WHERE {tatamiFilter}) C ON A.categoryId = C.CategoryId "
            f"WHERE {timeFilter} "
            "ORDER BY C.tatamiId, A.Time"
        )

        cursor.execute(query)

        categoriesDetails = tatami_one_fetch(cursor, None)

        if categoriesDetails:
            places = []
            for categoryDetails in categoriesDetails:

                firstPlace = getParticipantInfo(
                    title, champType, categoryDetails["idxAth1Place"]
                )

                if firstPlace:
                    firstPlace["place"] = 1
                    # firstPlace.pop("OrdNum", None)
                    places.append(firstPlace)

                secondPlace = getParticipantInfo(
                    title, champType, categoryDetails["idxAth2Place"]
                )

                if secondPlace:
                    secondPlace["place"] = 2
                    # secondPlace.pop("OrdNum", None)
                    places.append(secondPlace)

                thirdPlace = getParticipantInfo(
                    title, champType, categoryDetails["idxAth3Place"]
                )

                if thirdPlace:
                    thirdPlace["place"] = 3
                    # thirdPlace.pop("OrdNum", None)
                    places.append(thirdPlace)

                # if categoryDetails["Category3Place"] == "0":
                    oneMoreThirdPlace = getParticipantInfo(
                        title, champType, categoryDetails["idxAth4Place"]
                    )

                    if categoryDetails["Category3Place"] == "0":
                        if oneMoreThirdPlace:
                            oneMoreThirdPlace["place"] = (
                                3 if categoryDetails["Category3Place"] == "0" else 4
                            )
                            # oneMoreThirdPlace.pop("OrdNum", None)
                            places.append(oneMoreThirdPlace)

                # categoriesResults.append(
                #     {"category": categoryDetails, "places": places}
                # )
        # places = sorted(places, key = places.__getitem__)
        # except:
        #     HttpResponse(status=400)
    return JsonResponse(places, status=200, safe=False)

@csrf_exempt
def getClubResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("club", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def getClubQuotaResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("club", title, champType, True)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def getClubCountResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityClubCountResults("club", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def getCoachCountResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityCoachCountResults("coach", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def getClubWomenResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityClubWomenResults("club", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def getCoachResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("coach", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def getCoachQuotaResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("coach", title, champType, True)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def getCountryResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("country", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def getOrganizationResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("organization", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def getRegionResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("region", title, champType)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def getRegionQuotaResults(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        title = json_string.get("title")
        champType = getChampType(title)

        if all(i is None for i in [title]):
            return HttpResponse(status=400)

        result = getEntityResults("region", title, champType, True)

        # except:
        #     HttpResponse(status=400)
    return JsonResponse(result, status=200, safe=False)

# @csrf_exempt
# def _GetWeight(request):
#     if request.method == 'POST':
#         json_string = JSONParser().parse(request)
#         try:
#             title = json_string.get('title')
#             title = title.replace(" ", "_")
#             cursor = connection.cursor()
#             cursor.execute('SELECT DISTINCT weight from ' + json_string.get('title') +
#                            '_athchamp ORDER BY weight ASC')
#             data_to_return = [x[0] for x in cursor.fetchall()]
#             list_to_return = {}
#             it = 1
#             for item in data_to_return:
#                 list_to_return[it] = item
#                 it += 1
#         except:
#             return HttpResponse(status=400)
#
#         return JsonResponse(list_to_return, status=200)
#
#     return HttpResponse(status=200)


# @csrf_exempt
# def InsertCurrentChampAbout(request):
#     if request.method == 'POST':
#         json_string = JSONParser().parse(request)
#
#         if (title := json_string.get('title')) and (table := json_string.get('table')):
#             if (table not in ('about', 'athletes', 'category', 'champ', 'club', 'coach', 'tatami')) or \
#                   (json_string.get('1') == False): return HttpResponse(status=400)
#             el_cnt = 1
#             cursor = connection.cursor()
#             while el := json_string.get(str(el_cnt)):
#                 # id = count of columns
#                 cursor.execute('INSERT INTO '+title.lower()+'_'+table +
#                                ' VALUES (' + ', '.join([str(el[x]) if type(el[x]) == int else "'" + str(el[x])
#                                + "'" for x in rows_of_tables[table]]) + ')')
#                 el_cnt += 1
#         else:
#             return HttpResponse(status=400)
#
#     return HttpResponse(status=201)


@csrf_exempt
def GetAllChamps(request):
    if request.method == "GET":
        # try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM champs ORDER BY champFrom DESC")
        data_to_return = dict_fetch_all(cursor)
        # except:
            # HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)


# GetCurrentChampAbout = sync_to_async(_GetCurrentChampAbout, thread_sensitive=True)
# GetWeight = sync_to_async(_GetWeight, thread_sensitive=True)


#


def sendRegistrationEmail(email, username, password, lng):
    lng = lng.lower() if lng != None else "en"

    subject = "Alliance Kumite"
    # TODO: Do not hardcode langs here
    if lng == "ua":
        msg = f"Вітання, {username}<br /><br />Ваш Alliance Kumite аккаунт:<br />Ім'я: {email}<br />Пароль: {password}"
    elif lng == "ru":
        msg = f"Здраствуйте, {username}<br /><br />Ваш Alliance Kumite аккаунт:<br />Имя: {email}<br />Пароль: {password}"
    else:
        msg = f"Hello, {username}<br /><br />Your Alliance Kumite account:<br />Username: {email}<br />Password: {password}"

    to = email
    res = send_mail(subject, msg, settings.APP_EMAIL, [to], html_message=msg)

    # from django.core.mail import EmailMessage
    # mail = EmailMessage(subject, msg, settings.APP_EMAIL, ['receiver@example.com', ]
    #     msg.content_subtype = "html"
    # msg.send()

    return res


@csrf_exempt
def Register(request):
    if request.method == "POST":
        json_string = JSONParser().parse(request)

        lng = json_string.get("lng")

        _coachName = json_string.get("username")
        _email = json_string.get("email").lower()
        _club = json_string.get("club")
        _countryId = json_string.get("country")
        _region = json_string.get("region")
        _city = json_string.get("city")
        _organization = json_string.get("organization")
        _branchId = json_string.get("branch")
        _password = json_string.get("password")

        _coachId = json_string.get("coachId")

        # User.objects.get(username=_coachName, email=_email)
        error = validateUser(_email, _coachId)
        if error:
            return JsonResponse(error, status=422, safe=False)

        organization = findOrCreateOrganization(_organization)
        branch = findBranch(_branchId)
        country = findCountry(_countryId, lng)
        region = findOrCreateRegion(_region, country, lng)
        city = findOrCreateCity(_city, country, region)
        club = findOrCreateClub(_club, country, region, organization)

        if _coachId is None:
            # Create new coach
            user = createAuthUser(_coachName, _email, _password)

            # Coaches.objects.get(
            #     **{ 'userId__email' : email }
            # )

            # cursor = connection.cursor()
            # cursor.execute(f'''
            #     SELECT * FROM coaches WHERE coachName LIKE '%{_coachName}%'
            # ''')

            # coach = fetch_all(cursor)
            # if coach is not None and len(coach) > 0:
            #     cursor.execute(f'''
            #                     UPDATE coaches SET eMail = "{_email}", password = "{_password}", clubId = {club.clubId}, countryId = {country.countryId}, regionId = {region.regionId}, user_id = {user.id}, branchId = {branch.branchId}, city = {city.cityId}, organizationId = {organization.orgId}  WHERE coachName LIKE '%{_coachName}%'
            #                 ''')
            # else:

            # print("===============")
            # print(region)
            # print(city)
            # print(club)

            coach = Coaches.objects.create(
                organizationId=(organization.orgId if organization != None else 0),
                branchId=branch,
                countryId=country,
                regionId=region,
                city=city,
                clubId=club,
                blocked=False,
                user=user,
                # TODO: dont save coachName, email and password - duplicated from uath_user
                coachName=_coachName,
                email=_email,
                password=_password,
            )

            coach.save()

            # TODO: Fix gmail smtp to work
            # sendRegistrationEmail(_email, _coachName, _password, lng)
        else:
            coach = Coaches.objects.get(coachId=_coachId)
            # user = User.objects.get(username=coach.coachName, email=coach.email)
            # user = User.objects.get(id=coach.userId)

            # print("====f========f=====f====================")
            # print(coach)
            # print("=====================================")

            user = coach.user

            user.email = _email
            user.username = _coachName

            if len(_password) > 0:
                user.password = make_password(_password)

            user.save()

            coach.organizationId = organization.orgId
            coach.branchId = branch
            coach.countryId = country
            coach.regionId = region
            coach.cityId = city
            coach.clubId = club

            if len(_password) > 0:
                coach.password = _password

            # TODO: dont save coachName, email and password - duplicated from uath_user
            coach.coachName = _coachName
            coach.email = _email
            coach.save()

        generateTranslations()

        #     return HttpResponse(status=200)

        return HttpResponse(status=200)


def validateUser(email, authorizedCoachId):
    # User.objects.get(username=_coachName, email=_email)
    error = None
    users = User.objects.filter(email=email)

    if len(users) > 0:
        if authorizedCoachId is None:
            # New user is being registering
            error = [{"email": "taken"}]
        else:
            # coaches = Coaches.objects.filter(userId__id = users[0].id)
            coaches = (
                Coaches.objects.select_related().filter(user=users[0].id).values()[0]
            )
            coach = coaches

            if len(coaches) or True > 0:
                # coach = coaches[0]

                if coach["coachId"] != authorizedCoachId:
                    # This email is other user's email
                    error = [{"email": "taken"}]
                else:
                    # Autorized user operates with his email
                    pass

    return error


def findOrCreateRegion(regionIdOrName, country, lng):
    region = []

    if regionIdOrName is not None and regionIdOrName != "":
        try:
            # Lets take that regionIdOrName is an id of a region
            regionIdOrName = int(regionIdOrName)
            region = Regions.objects.filter(regionId=regionIdOrName)
        except:
            pass

        if len(region) == 0:
            # If its not an id may be it is its name
            nameField = "regionName" + lng.capitalize()

            # print("============================")
            # print(regionIdOrName)

            # case insensitive search
            region = Regions.objects.filter(
                **{nameField + "__iexact": regionIdOrName, "countryId": country}
            )

            # If still region isn't fount
            if len(region) == 0:
                # then lets create it
                region = Regions.objects.create(
                    **{nameField: regionIdOrName, "countryId": country}
                )
            else:
                region = region[0]
        else:
            region = region[0]

    # print(region)
    return region if region != [] else None


def findOrCreateCity(cityIdOrName, country, region):
    # try:
    #     city = CityOnline.objects.get(cityName=_city)
    # except CityOnline.DoesNotExist as e:
    #     city = CityOnline.objects.create(cityName=_city, countryId=country, regionId=region)

    city = []

    if cityIdOrName is not None and cityIdOrName != "":
        try:
            # Lets take that cityIdOrName is an id of a region
            cityIdOrName = int(cityIdOrName)
            city = City.objects.filter(cityId=cityIdOrName)
        except:
            pass

        if len(city) == 0:
            # If its not an id may be it is its name
            nameField = "cityName"

            # case insensitive search
            if region != None:
                city = City.objects.filter(
                    **{
                        nameField + "__iexact": cityIdOrName,
                        "countryId": country,
                        "regionId": region,
                    }
                )
            else:
                city = City.objects.filter(
                    **{nameField + "__iexact": cityIdOrName, "countryId": country}
                )

            # print("city")
            # print(city)

            # If still city isn't fount
            if len(city) == 0:
                # then lets create it
                if region != None:
                    city = City.objects.create(
                        **{
                            nameField: cityIdOrName,
                            "countryId": country,
                            "regionId": region,
                        }
                    )
                else:
                    city = City.objects.create(
                        **{nameField: cityIdOrName, "countryId": country}
                    )
            else:
                city = city[0]
        else:
            city = city[0]

    return city if city != [] else None


def findOrCreateOrganization(organizationIdOrName):
    # try:
    #     organization = OrganizationOnline.objects.get(orgName=_organization)
    # except:
    #     organization = OrganizationOnline.objects.create(orgName=_organization)

    organization = []

    try:
        # Lets take that organizationIdOrName is an id of a organization
        organizationIdOrName = int(organizationIdOrName)

        organization = Organization.objects.filter(orgId=organizationIdOrName)
    except:
        pass

    if len(organization) == 0:
        # If its not an id may be it is its name
        nameField = "orgName"

        # case insensitive search
        organization = Organization.objects.filter(
            **{nameField + "__iexact": organizationIdOrName}
        )

        # If still organization isn't found
        if len(organization) == 0:
            # then lets create it
            organization = Organization.objects.create(
                **{nameField: organizationIdOrName}
            )
        else:
            organization = organization[0]
    else:
        organization = organization[0]

    return organization


def findOrCreateClub(clubIdOrName, country, region, organization):
    club = []

    if clubIdOrName is not None and clubIdOrName != "":
        try:
            # Lets take that clubIdOrName is an id of a club
            clubIdOrName = int(clubIdOrName)
            club = Clubs.objects.filter(clubId=clubIdOrName)
        except:
            pass

        if len(club) == 0:
            # If its not an id may be it is its name
            nameField = "clubName"

            # case insensitive search
            club = Clubs.objects.filter(**{nameField + "__iexact": clubIdOrName})

            # If still club isn't fount
            if len(club) == 0:
                # then lets create it
                club = Clubs.objects.create(
                    **{
                        nameField: clubIdOrName,
                        "countryId": country,
                        "regionId": region,
                        "orgId": organization,
                    }
                )
            else:
                club = club[0]
        else:
            club = club[0]

    return club if club != [] else None


def findBranch(branchIdOrName):
    branch = []

    if branchIdOrName is not None and branchIdOrName != "":
        try:
            # Lets take that clubIdOrName is an id of a club
            branchIdOrName = int(branchIdOrName)
            branch = Branch.objects.filter(branchId=branchIdOrName)
        except:
            pass

        if len(branch) == 0:
            # If its not an id may be it is its name
            nameField = "branchName"

            # case insensitive search
            branch = Branch.objects.filter(**{nameField + "__iexact": branchIdOrName})

            # If still club isn't fount
            if len(branch) == 0:
                # then lets create it
                # club = Clubs.objects.create (
                #     **{  nameField : clubIdOrName,
                #         'countryId' : country,
                #         'regionId' : region,
                #         'orgId' : organization
                #     }
                # )
                pass
            else:
                branch = branch[0]
        else:
            branch = branch[0]

    return branch if branch != [] else None

    return branch


def findCountry(countryIdOrName, lng):
    country = []

    if countryIdOrName is not None and countryIdOrName != "":
        #     country = Countries.objects.get(countryId=countryId)

        # return country

        try:
            # Lets take that countryIdOrName is an id of a country
            countryIdOrName = int(countryIdOrName)
            country = Countries.objects.filter(countryId=countryIdOrName)
        except:
            pass

        if len(country) == 0:
            # If its not an id may be it is its name
            nameField = "countryName" + lng.capitalize()

            # print("============================")
            # print(countryIdOrName)

            # case insensitive search
            country = Countries.objects.filter(
                **{nameField + "__iexact": countryIdOrName}
            )

            countryUa = Countries.objects.filter(
                **{"countryNameUa__iexact": countryIdOrName}
            )

            countryRu = Countries.objects.filter(
                **{"countryNameRu__iexact": countryIdOrName}
            )

            countryEn = Countries.objects.filter(
                **{"countryNameEn__iexact": countryIdOrName}
            )

            # If still country isn't fount
            if len(countryUa) > 0:
                country = countryUa[0]
            elif len(countryRu) > 0:
                country = countryRu[0]
            elif len(countryEn) > 0:
                country = countryEn[0]
        else:
            country = country[0]

    # print(country)
    return country if country != [] else None


def createAuthUser(username, email, password):
    # Update auth_user table with authentification info
    user = User.objects.create(
        username=username, email=email, password=make_password(password)
    )
    user.is_superuser = False
    user.is_staff = True
    user.save()

    return user


@csrf_exempt
def CountrySelection(request):
    if request.method == "GET":
        countries = Countries.objects.all()
        serialized = CountrySerializer(countries, many=True)
        result = serialized.data

        return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def RegionSelection(request):
    if True or request.method == "GET":
        json_string = JSONParser().parse(request)

        country = json_string.get("country")
        lng = json_string.get("lng")

        if lng == None or lng == "":
            lng = "Ua"

        regions = None

        if country != None and country != "":
            # print(type(country))

            try:
                country = int(country)

                regions = Regions.objects.filter(countryId=country)
            except:
                # Entry.objects.filter(blog__name='Beatles Blog')
                regions = Regions.objects.filter(
                    **{"countryId__countryName" + lng.capitalize(): country}
                )
            # .values_list('data', flat=True)
        # else :
        # regions = Regions.objects.all()

        serialized = RegionSerializer(regions, many=True)
        result = serialized.data

        return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def ClubSelection(request):
    if True or request.method == "GET":
        json_string = JSONParser().parse(request)

        country = json_string.get("country")
        region = json_string.get("region")
        lng = json_string.get("lng")

        if lng == None or lng == "":
            lng = "Ua"

        cities = None

        if region != None and region != "":
            try:
                region = int(region)
                cities = Clubs.objects.filter(regionId=region)
            except:
                cities = Clubs.objects.filter(
                    **{"regionId__regionName" + lng.capitalize(): region}
                )

        elif country != None and country != "":
            try:
                country = int(country)

                cities = Clubs.objects.filter(countryId=country)
            except:
                cities = Clubs.objects.filter(
                    **{"countryId__countryName" + lng.capitalize(): country}
                )

        serialized = ClubSerializer(cities, many=True)
        result = serialized.data

        return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def CitySelection(request):
    if True or request.method == "GET":
        json_string = JSONParser().parse(request)

        country = json_string.get("country")
        region = json_string.get("region")
        lng = json_string.get("lng")

        if lng == None or lng == "":
            lng = "Ua"

        cities = None

        if region != None and region != "":
            try:
                region = int(region)
                cities = City.objects.filter(regionId=region)
            except:
                cities = City.objects.filter(
                    **{"regionId__regionName" + lng.capitalize(): region}
                )

        elif country != None and country != "":
            try:
                country = int(country)

                cities = City.objects.filter(countryId=country)
            except:
                cities = City.objects.filter(
                    **{"countryId__countryName" + lng.capitalize(): country}
                )

        serialized = CitySerializer(cities, many=True)
        result = serialized.data

        return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def OrganizationSelection(request):
    if request.method == "GET":
        organization = Organization.objects.all()
        serialized = OrganizationSerializer(organization, many=True)
        result = serialized.data

        return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def BranchSelection(request):
    if request.method == "GET":
        branch = Branch.objects.all()
        serialized = BranchSerializer(branch, many=True)
        result = serialized.data

        return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def getCurrentCoachRequest(request):
    if request.method == "GET":
        # try:
        full_token = request.headers["Authorization"]

        _coach = getCurrentUser(full_token)

        return JsonResponse(_coach, safe=False)
        # return HttpResponse(status=400)
        # except Exception as e:
        #     return HttpResponse(status=400)


@csrf_exempt
def isSuperAdminRequest(request):
    if request.method == "GET":
        try:
            full_token = request.headers["Authorization"]

            isSuperAdmin = isSuperAdmin(full_token)

            return JsonResponse({"isSuperAdmin": isSuperAdmin}, status=200)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)


@csrf_exempt
def isSuperAdminRequest(request):
    if request.method == "GET":
        try:
            full_token = request.headers["Authorization"]

            superAdmin = isSuperAdmin(full_token)

            return JsonResponse({"isSuperAdmin": superAdmin}, status=200)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)


@csrf_exempt
def GetCurrentChamp(request):
    if request.method == "GET":
        cursor = connection.cursor()
        cursor.execute(
            "SELECT title FROM champs WHERE DATE(NOW()) between champRegFrom and champRegTo"
        )
        title = cursor.fetchall()
        if title == ():
            return HttpResponse(status=200)
        else:
            return JsonResponse({"title": title[0][0]}, status=200)

    return HttpResponse(status=400)

@csrf_exempt
def GetAllClubSelection(request):
    if request.method == "POST":
        # json_string = JSONParser().parse(request)

        # title = json_string.get("title")
        # title = title.replace(" ", "_")
        
        # try:
        cursor = connection.cursor()
        # query = (
        #         "SELECT clubId, clubName, clubLogo FROM clubs"
        #     )
        query = (
        "SELECT clubId, clubName, clubLogo, countryId FROM clubs order by clubId"
        )
        cursor.execute(query)
        data_to_return = fetch_clubs_all_info(cursor)

        # except:
        #     return HttpResponse(status=400)

        return JsonResponse(data_to_return, status=200)
