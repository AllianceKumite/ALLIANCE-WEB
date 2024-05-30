from django.contrib import admin
from django.conf.urls import include
from django.urls import path
from registration.views import *
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-champ', CreateChampView),                                     # create champ
    path('api-champ-delete', DeleteChampView),                              # delete champ by title
    path('api-get-type-champ', GetTypeChamp),                               # get type of champ
    # path('api-champ-info', GetCurrentChampAbout),                         # --
    path('api-champ-get-countries', GetCountriesDynamic),                   # get countries taking place in champ
    path('api-champ-get-regions', GetRegionsDynamic),                       # get regions taking place in champ
    path('api-champ-get-participants', GetParticipantsRequest),             # get participants from champ
    path('api-champ-get-participants-count', GetParticipantsCount),         # get participants from champ
    path('api-champ-get-categories', GetCategoryDynamic),                   # get all categories from champ
    path('api-champ-get-categories-time', GetCategoryTimeDynamic),                   # get all categories from champ
    path('api-champ-get-tatami', GetTatamiCurrentFightAndAllCategories),    # get tatami referenced with cat. for dropL.
    path('api-champ-get-tatami-time', GetTatamiCurrentFightByTimeAndAllCategories),    # get tatami referenced with cat. for dropL.

    path('api-champ-get-tatami-urlvideo', GetTatamiUrlVideo),
    path('api-champ-get-tatamis-current-fight', GetTatamisCurrentFight),    # get tatami referenced with cat. for dropL.
    path('api-champ-get-referys', GetReferysRequest),                       # get referys from champ
    path('api-champ-get-referys-coach', GetReferysCoachRequest),            # get referys from champ by coach
    path('api-champ-get-part-next-fight-coach', GetNextFightByCoach),       # get referys from champ by coach
    path('api-champ-get-part-next-fight-club', GetNextFightByClub),         # get referys from champ by coach

    path('api-champ-set-tatami', SetTatamiCategory),                        # set tatami num by category before drop
    path('api-champ-create-virtual-data', SelectByLevelAndCreateTable),     # set tatami num by category before drop
    path('api-champ-create-copy-champ-data', CreateCopyChampData),     # set tatami num by category before drop

    


    path('api-champ-get-coaches', getCoaches),                              # get all clubs taking place in champ
    path('api-champ-get-clubs', GetClubsDynamic),                           # get all clubs taking place in champ
    path('api-champ-get-categories-info', GetCategories),                           # get all clubs taking place in champ
    path('api-champ-get-all-clubs', GetAllClubsDynamic),                           # get all clubs taking place in champ
    path('api-champ-get-tatami-all', GetTatamiAll),                         # return count of tatami
    path('api-champ-get-times-by-tatami', GetTimesByTatamiRequest),

    # path('api-champ-ath-weight', GetWeight),                              # get weight to form cat for participants
    # path('api-champ-paste', InsertCurrentChampAbout),                     # --
    path('api-champ-get-all-champs-info', GetAllChamps),                    # params from all champs from champs Table
    path('api-champ-get-draw-by-categories', GetCategorySVG),
    path('api-champ-get-data-for-draw-by-categories', getDataForDrawByCategories),

    path('api-champ-get-individual-results', getIndividualResults),
    path('api-champ-get-individual-results-club', getIndividualResultsByClub),
    path('api-champ-get-club-results', getClubResults),
    path('api-champ-get-club-quota-results', getClubQuotaResults),

    path('api-champ-get-club-count-results', getClubCountResults),
    path('api-champ-get-club-women-results', getClubWomenResults),
    path('api-champ-get-coach-count-results', getCoachCountResults),

    path('api-champ-get-coach-quota-results', getCoachQuotaResults),
    path('api-champ-get-region-quota-results', getRegionQuotaResults),

    path('api-champ-get-coach-results', getCoachResults),
    path('api-champ-get-country-results', getCountryResults),
    path('api-champ-get-organization-results', getOrganizationResults),
    path('api-champ-get-region-results', getRegionResults),

    path('api-get-regions', RegionSelection),
    path('api-get-countries', CountrySelection),
    path('api-get-clubs', ClubSelection),
    path('api-get-any-clubs', GetAllClubSelection),
    path('api-get-current-champ', GetCurrentChamp),
    path('api-get-city', CitySelection),
    path('api-get-organization', OrganizationSelection),
    path('api-get-branch', BranchSelection),

    path('api-reset-password-email', ResetPasswordEmail),
    path('api-reset-password-coach', ResetPassword),

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ J W T ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@

    path('api-token-auth/', MyAuthToken.as_view()),
    # path('api-token-auth-admin/', MyAuthToken.as_view()),
    # path('api-token-auth-admin/', obtain_jwt_token),
    path('api-token-refresh/', refresh_jwt_token),
    path('api/registration', include('rest_framework.urls', namespace='rest_framework')),
    path('api-registration', Register),
    path('api-is-super-admin', isSuperAdminRequest),
    path('api-get-current-user', getCurrentCoachRequest),
]

# https://stackoverflow.com/questions/53945056/django-rest-auth-password-reset
