"""
User serializers for authentication and profile management.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm',
        )
        read_only_fields = ('id',)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "This account has been deactivated."
            )

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for nested representations."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'role', 'avatar', 'created_at',
        )
        read_only_fields = ('id', 'email', 'created_at')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'role', 'avatar', 'phone', 'bio',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'email', 'role', 'created_at', 'updated_at')
