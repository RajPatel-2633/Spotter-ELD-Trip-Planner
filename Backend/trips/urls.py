from django.urls import path
from .views import TripPlanView, TripHistoryView

urlpatterns = [
    path('plan', TripPlanView.as_view(), name='trip_plan'),
    path('history', TripHistoryView.as_view(), name='trip_history'),
]
