import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="text-6xl">❌</div>
          </div>
          <CardTitle className="text-3xl font-bold">Authentication Error</CardTitle>
          <CardDescription className="text-base">
            There was an error during the authentication process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            The authentication code could not be exchanged for a session. This might be because:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>The code has expired</li>
            <li>The code has already been used</li>
            <li>There was a configuration error</li>
          </ul>
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
              <Link href="/login">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
