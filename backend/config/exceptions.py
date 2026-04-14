"""
Custom exception handler for DRF.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Enhanced exception handler with structured error responses."""
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'success': False,
            'error': {
                'status_code': response.status_code,
                'message': _get_error_message(response),
                'details': response.data,
            }
        }
        response.data = custom_response
    else:
        # Unhandled exceptions
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        response = Response(
            {
                'success': False,
                'error': {
                    'status_code': 500,
                    'message': 'An unexpected error occurred.',
                    'details': str(exc) if True else None,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _get_error_message(response):
    """Extract a human-readable error message from the response."""
    status_messages = {
        400: 'Bad request.',
        401: 'Authentication credentials were not provided or are invalid.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        405: 'Method not allowed.',
        409: 'Conflict with the current state of the resource.',
        429: 'Too many requests. Please try again later.',
    }
    return status_messages.get(response.status_code, 'An error occurred.')
