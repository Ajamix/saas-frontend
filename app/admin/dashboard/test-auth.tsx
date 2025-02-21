import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthClient from '@/app/api/auth-client';
import TokenService from '@/app/lib/auth/tokens';

export default function TestAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [decodedAccess, setDecodedAccess] = useState<any>(null);
  const [decodedRefresh, setDecodedRefresh] = useState<any>(null);
  const [lastApiCall, setLastApiCall] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateTokenInfo();
  }, []);

  const updateTokenInfo = () => {
    const access = TokenService.getAccessToken();
    const refresh = TokenService.getRefreshToken();
    
    setAccessToken(access);
    setRefreshToken(refresh);
    
    if (access) {
      const decoded = TokenService.decodeToken(access);
      setDecodedAccess(decoded);
    }
    
    if (refresh) {
      const decoded = TokenService.decodeToken(refresh);
      setDecodedRefresh(decoded);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const timeUntilExpiry = (exp: number) => {
    const now = Date.now() / 1000;
    const diff = exp - now;
    return Math.round(diff);
  };

  const testApiCall = async () => {
    setLoading(true);
    try {
      const result = await AuthClient.get('/admin-dashboard');
      setLastApiCall('Success: ' + new Date().toLocaleString());
      updateTokenInfo(); // Update token info after successful call
    } catch (error) {
      setLastApiCall('Failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Test Panel</CardTitle>
          <CardDescription>Monitor and test token refresh functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Access Token</h3>
              <div className="text-sm text-muted-foreground break-all">
                {accessToken ? (
                  <>
                    <div>Expires: {decodedAccess?.exp && formatTime(decodedAccess.exp)}</div>
                    <div>Time until expiry: {decodedAccess?.exp && timeUntilExpiry(decodedAccess.exp)}s</div>
                    <div>Valid: {TokenService.isTokenValid(accessToken) ? 'Yes' : 'No'}</div>
                  </>
                ) : (
                  'No access token'
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Refresh Token</h3>
              <div className="text-sm text-muted-foreground break-all">
                {refreshToken ? (
                  <>
                    <div>Expires: {decodedRefresh?.exp && formatTime(decodedRefresh.exp)}</div>
                    <div>Time until expiry: {decodedRefresh?.exp && timeUntilExpiry(decodedRefresh.exp)}s</div>
                    <div>Valid: {TokenService.isTokenValid(refreshToken) ? 'Yes' : 'No'}</div>
                  </>
                ) : (
                  'No refresh token'
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Last API Call</h3>
            <div className="text-sm text-muted-foreground">{lastApiCall || 'No calls made yet'}</div>
          </div>

          <div className="flex gap-4">
            <Button onClick={testApiCall} disabled={loading}>
              {loading ? 'Testing...' : 'Test API Call'}
            </Button>
            <Button variant="outline" onClick={updateTokenInfo}>
              Refresh Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 