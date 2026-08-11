from rest_framework import serializers

class TripInputSerializer(serializers.Serializer):
    current_location = serializers.CharField(required=False, allow_blank=True)
    pickup_location = serializers.CharField(required=False, allow_blank=True)
    dropoff_location = serializers.CharField(required=False, allow_blank=True)
    current_cycle_used = serializers.FloatField(required=False, default=0.0)

    # Support camelCase inputs
    currentLocation = serializers.CharField(required=False, allow_blank=True)
    pickupLocation = serializers.CharField(required=False, allow_blank=True)
    dropoffLocation = serializers.CharField(required=False, allow_blank=True)
    currentCycleUsed = serializers.FloatField(required=False, default=None)
    driver_name = serializers.CharField(required=False, allow_blank=True)
    driverName = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        # Resolve camelCase fallback
        current_loc = data.get('current_location') or data.get('currentLocation') or ''
        pickup_loc = data.get('pickup_location') or data.get('pickupLocation') or ''
        dropoff_loc = data.get('dropoff_location') or data.get('dropoffLocation') or ''
        
        cycle_used = data.get('current_cycle_used')
        if data.get('currentCycleUsed') is not None:
            cycle_used = data.get('currentCycleUsed')
        if cycle_used is None:
            cycle_used = 0.0

        if not current_loc.strip():
            raise serializers.ValidationError({"currentLocation": "Current location is required."})
        if not pickup_loc.strip():
            raise serializers.ValidationError({"pickupLocation": "Pickup location is required."})
        if not dropoff_loc.strip():
            raise serializers.ValidationError({"dropoffLocation": "Dropoff location is required."})

        if cycle_used < 0.0 or cycle_used > 70.0:
            raise serializers.ValidationError({"currentCycleUsed": "Cycle used must be between 0 and 70 hours."})

        if current_loc.strip().lower() == pickup_loc.strip().lower():
            raise serializers.ValidationError({"pickupLocation": "Pickup location must be different from current location."})

        if pickup_loc.strip().lower() == dropoff_loc.strip().lower():
            raise serializers.ValidationError({"dropoffLocation": "Dropoff location must be different from pickup location."})

        driver_name = data.get('driver_name') or data.get('driverName') or ''

        return {
            "current_location": current_loc.strip(),
            "pickup_location": pickup_loc.strip(),
            "dropoff_location": dropoff_loc.strip(),
            "current_cycle_used": float(cycle_used),
            "driver_name": driver_name.strip(),
        }
