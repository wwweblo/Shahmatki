import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
    
    if (isAdminPage) {
        const token = await getToken({ 
            req: request, 
            secret: process.env.AUTH_SECRET 
        })

        // Ensure attributes is an array
        const userAttributes = Array.isArray(token?.attributes) 
            ? token.attributes 
            : Object.values(token?.attributes || {});

        console.log('Debug: Token received:', {
            hasToken: !!token,
            rawAttributes: token?.attributes,
            processedAttributes: userAttributes,
            attributesType: typeof token?.attributes
        });

        if (!userAttributes.length) {
            return new NextResponse(JSON.stringify({ 
                error: 'Access denied: No admin attributes found',
                userAttributes: userAttributes,
                message: 'Your account has no attributes assigned',
                debug: {
                    tokenExists: !!token,
                    rawAttributes: token?.attributes,
                    processedAttributes: userAttributes
                }
            }), { 
                status: 403,
                headers: { 'content-type': 'application/json' }
            });
        }

        const requiredAttributes = ['admin-users', 'admin-attributes', 'admin-articles']
        const hasRequiredAttributes = requiredAttributes.every(attr => 
            userAttributes.includes(attr)
        )

        if (!hasRequiredAttributes) {
            const missing = requiredAttributes.filter(attr => !userAttributes.includes(attr));
            return new NextResponse(JSON.stringify({ 
                error: 'Access denied: Insufficient admin privileges',
                userAttributes: userAttributes,
                requiredAttributes,
                missing,
                message: `You have [${userAttributes.join(', ')}], but need [${requiredAttributes.join(', ')}]`,
                debug: {
                    rawAttributes: token?.attributes,
                    processedAttributes: userAttributes
                }
            }), { 
                status: 403,
                headers: { 'content-type': 'application/json' }
            });
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*']
}