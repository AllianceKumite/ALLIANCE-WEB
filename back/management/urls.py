from django.urls import path
from management.views import *

urlpatterns = [
    # path('api-set-subtimes', setSubtimes),
    path('api-get-subtimes', getSubtimes),
    path('api-get-fights-to-manage', getFightsToManageRequest),
    path('api-get-categories-by-filter', getСategoryForTimeAndTatami),
    path('api-set-fight-winner', setFightWinnerRequest),
    path('api-cancel-fights', cancelFightsRequest),
    path('api-postpone-fights', postponeFightsRequest),
    path('api-unpostpone-fights', unpostponeFightsRequest),
    path('api-update-switchers', updateSwitchersRequest),
    path('api-champ-get-online-tatami-fights', GetOnlineTatamiFights),                      # all future and current duels by tatamiId
    path('api-champ-get-online-all-tatamis-fights', GetOnlineAllTatamisFights),

    path('api-champ-get-online-tatami-timer', GetOnlineTatamiTimer),
    path('api-champ-set-online-tatami-timer', SetOnlineTatamiTimer),
    path('api-get-kata', getAllKata),
    path('api-get-level-kata', getAllLevelKata),

    # path('api-create-pdf-file', createPdfFile)

]
