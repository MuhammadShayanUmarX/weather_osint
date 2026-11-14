"""Domain enums shared by document models and API schemas."""

from __future__ import annotations

from enum import Enum


class ObservationType(str, Enum):
    WEATHER = "weather"
    RAINFALL = "rainfall"
    FLOOD = "flood"
    AIR_QUALITY = "air_quality"
    FIRE = "fire"
    DROUGHT = "drought"
    VEGETATION = "vegetation"
    WATER_LEVEL = "water_level"
    OTHER = "other"


class QualityStatus(str, Enum):
    VERIFIED = "verified"
    PROVISIONAL = "provisional"
    SUSPECT = "suspect"
    INVALID = "invalid"


class Severity(str, Enum):
    INFO = "info"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    MONITORING = "monitoring"
    RESOLVED = "resolved"
    ARCHIVED = "archived"


class AlertType(str, Enum):
    FLOOD = "flood"
    WILDFIRE = "wildfire"
    DROUGHT = "drought"
    AIR_QUALITY = "air_quality"
    STORM = "storm"
    HEAT = "heat"
    OTHER = "other"


class SourceType(str, Enum):
    WEATHER = "weather"
    SATELLITE = "satellite"
    AIR_QUALITY = "air_quality"
    HYDROLOGY = "hydrology"
    FIRE = "fire"
    GOVERNMENT = "government"
    RESEARCH = "research"
    OTHER = "other"


class AccessType(str, Enum):
    OPEN = "open"
    PUBLIC_API = "public_api"
    AUTHENTICATED_API = "authenticated_api"
    RESTRICTED = "restricted"
