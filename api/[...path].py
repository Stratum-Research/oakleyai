"""
Vercel serverless function adapter for FastAPI application.
This file wraps the FastAPI app using Mangum to make it compatible with Vercel's serverless functions.
"""

from mangum import Mangum
from main import app

# Create the ASGI handler for Vercel
handler = Mangum(app, lifespan="off")


def lambda_handler(event, context):
    """AWS Lambda/Vercel serverless function handler."""
    return handler(event, context)
