# config/settings.py

from pathlib import Path
from datetime import timedelta
from decouple import config

# ─────────────────────────────────────────────
# BASE
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ✅ FIX 1: Removed the hardcoded insecure SECRET_KEY line above this
SECRET_KEY = config('SECRET_KEY')
DEBUG       = config('DEBUG', cast=bool, default=True)

# ✅ FIX 6: Added localhost and 127.0.0.1 for development
ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# ─────────────────────────────────────────────
# APPS
# ─────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',   # ✅ Needed for logout/token blacklisting
    'corsheaders',
    'django_filters',

    # Your apps
    'apps.users',
    'apps.schools',
    'apps.teachers',
    'apps.students',
    'apps.classes',
    'apps.attendance',
    'apps.homework',
    'apps.exams',
    'apps.fees',
    'apps.notifications',
]


# ─────────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # Must stay FIRST
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF      = 'config.urls'
WSGI_APPLICATION  = 'config.wsgi.application'

# ✅ FIX 2: Prevents Django migration warnings about auto-generated primary keys
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'users.User'


# ─────────────────────────────────────────────
# TEMPLATES
# ─────────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],       # ✅ Added templates dir for report cards later
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ─────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.mysql',
        'NAME':     config('DB_NAME'),
        'USER':     config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST':     config('DB_HOST', default='localhost'),
        'PORT':     config('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',               # ✅ Supports emojis and all Unicode properly
        },
    }
}


# ─────────────────────────────────────────────
# ✅ FIX 3: REST FRAMEWORK (was completely missing)
# ─────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',   # All endpoints require login by default
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS':  'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# ─────────────────────────────────────────────
# ✅ FIX 4: JWT SETTINGS (was completely missing)
# ─────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':        timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME':       timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':        True,      # Issue new refresh token on every refresh
    'BLACKLIST_AFTER_ROTATION':     True,      # Old refresh tokens become invalid
    'AUTH_HEADER_TYPES':            ('Bearer',),
    'AUTH_TOKEN_CLASSES':           ('rest_framework_simplejwt.tokens.AccessToken',),
}


# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True       # ✅ OK for development only
# In production, replace the line above with:
# CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']


# ─────────────────────────────────────────────
# PASSWORD VALIDATION
# ─────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─────────────────────────────────────────────
# INTERNATIONALISATION
# ─────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Asia/Kolkata'      # ✅ Changed from UTC — you're in Bangalore
USE_I18N      = True
USE_TZ        = True


# ─────────────────────────────────────────────
# STATIC & MEDIA FILES
# ─────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ✅ FIX 5: MEDIA settings were completely missing — needed for file uploads
MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'