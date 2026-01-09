# JWT Authentication Configuration

## Current Configuration

**Token Expiration**: 365 days (1 year)

## How It Works

1. **Login Persistence**:
   - Token is stored in browser's `localStorage`
   - Token persists even after closing browser or losing internet connection
   - User stays logged in for 1 year unless they explicitly logout

2. **Token Storage**:
   - Token is saved in `localStorage` after successful login
   - Automatically sent with every API request via Authorization header
   - Only cleared when user explicitly logs out

3. **Offline Behavior**:
   - If internet connection is lost, user remains logged in
   - When connection is restored, API calls will work automatically
   - Token validation happens server-side when making API requests

## Security Considerations

For a home office/personal app:
- ✅ **1 year expiration** is reasonable for convenience
- ✅ Token stored in localStorage (survives browser restarts)
- ✅ User can always logout explicitly to clear token
- ✅ If token expires after 1 year, user will be redirected to login

**Note**: For a home app between two users (husband/wife), this convenience is more important than strict security. If you want even longer, we can extend to 2-3 years or make it configurable.

## Future Enhancements (Optional)

If you want "forever" login:
- Could extend to 10+ years
- Could implement token refresh mechanism
- Could make expiration configurable per user preference

For now, 1 year provides good balance between convenience and reasonable token rotation.
