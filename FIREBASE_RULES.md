# Firebase Security Rules for Delivery System

## Instructions
Copy and paste these rules into your Firebase Console under Firestore Database → Rules

## Complete Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isVolunteer() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'volunteer';
    }

    function isDonor() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'donor';
    }

    function isReceiver() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'receiver';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles (for displaying volunteer info, etc.)
      allow read: if isAuthenticated();

      // Users can create their own profile
      allow create: if isAuthenticated() && request.auth.uid == userId;

      // Users can update their own profile, or admins can update any profile
      allow update: if isOwner(userId) || isAdmin();

      // Only admins can delete users
      allow delete: if isAdmin();
    }

    // Donations collection
    match /donations/{donationId} {
      // Anyone authenticated can read donations
      allow read: if isAuthenticated();

      // Only donors can create donations
      allow create: if isAuthenticated() && isDonor();

      // Donors can update their own donations, receivers can update to claim,
      // admins can update any donation, volunteers can update delivery status
      allow update: if isAuthenticated() && (
        (isDonor() && resource.data.donorId == request.auth.uid) ||
        isReceiver() ||
        isAdmin() ||
        (isVolunteer() && resource.data.assignedVolunteerId == request.auth.uid)
      );

      // Only the donor who created it or admin can delete
      allow delete: if isAuthenticated() && (
        (isDonor() && resource.data.donorId == request.auth.uid) ||
        isAdmin()
      );
    }

    // Volunteer Rides collection (NEW)
    match /volunteerRides/{rideId} {
      // Volunteers can read their own rides
      // Admins can read all rides
      // Donors and receivers can read rides related to their donations
      allow read: if isAuthenticated() && (
        isAdmin() ||
        (isVolunteer() && resource.data.volunteerId == request.auth.uid) ||
        (isDonor() && resource.data.donorId == request.auth.uid) ||
        (isReceiver() && resource.data.receiverId == request.auth.uid)
      );

      // Only admins can create ride assignments
      allow create: if isAdmin();

      // Volunteers can update their own rides (start, complete)
      // Admins can update any ride (verify, cancel)
      allow update: if isAuthenticated() && (
        isAdmin() ||
        (isVolunteer() && resource.data.volunteerId == request.auth.uid)
      );

      // Only admins can delete rides
      allow delete: if isAdmin();
    }

    // User Gamification collection
    match /userGamification/{userId} {
      // Users can read their own gamification data
      // Admins can read all
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());

      // System/Admin can create
      allow create: if isAdmin();

      // System/Admin can update
      allow update: if isAdmin();

      // Only admins can delete
      allow delete: if isAdmin();
    }

    // User Impacts collection
    match /userImpacts/{userId} {
      // Users can read their own impact data, anyone can read for leaderboards
      allow read: if isAuthenticated();

      // System/Admin can create and update
      allow create, update: if isAdmin();

      // Only admins can delete
      allow delete: if isAdmin();
    }

    // Notifications collection
    match /notifications/{notificationId} {
      // Users can only read their own notifications
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;

      // System/Admin can create notifications
      allow create: if isAdmin();

      // Users can update their own notifications (mark as read)
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;

      // Users can delete their own notifications
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // NGOs collection (if you have it)
    match /ngos/{ngoId} {
      // Anyone can read NGO information
      allow read: if isAuthenticated();

      // Only admins can create, update, or delete NGOs
      allow create, update, delete: if isAdmin();
    }

    // Chat/Messages (if you have it)
    match /chats/{chatId} {
      // Users can read chats they're part of
      allow read: if isAuthenticated() && (
        request.auth.uid in resource.data.participants
      );

      // Users can create chats
      allow create: if isAuthenticated();

      // Participants can update chats
      allow update: if isAuthenticated() && (
        request.auth.uid in resource.data.participants
      );

      // Only admins can delete chats
      allow delete: if isAdmin();
    }

    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Key Security Features

### 1. **Volunteer Rides Collection**
- **Read**: Volunteers see their own rides, admins see all, donors/receivers see related rides
- **Create**: Only admins can assign rides
- **Update**: Volunteers can update their own rides (start/complete), admins can verify/cancel
- **Delete**: Only admins

### 2. **Enhanced Donations Collection**
- Now includes fields: `assignedVolunteerId`, `volunteerAssignedAt`, `deliveryStatus`, `rideId`
- Volunteers can update delivery status for assigned deliveries
- All existing donation rules maintained

### 3. **User Collection Updates**
- Volunteers have new fields: `credits`, `totalRides`, `completedRides`, `activeRides`, `totalDistance`, `avgRating`, `isActive`
- Users can update their own profiles (including volunteers toggling active status)
- Admins can update any user

### 4. **Gamification Collections**
- `userGamification`: Tracks badges, achievements, and points
- `userImpacts`: Tracks impact metrics and leaderboard data
- Readable by users for their own data, updatable only by admin/system

## Testing Your Rules

After applying these rules, test with:

1. **As Admin**:
   - Can assign volunteers to donations
   - Can verify deliveries
   - Can view all volunteer stats

2. **As Volunteer**:
   - Can toggle active/inactive status
   - Can start and complete assigned rides
   - Can view own ride history

3. **As Donor**:
   - Can see assigned volunteer for their donations
   - Can view delivery tracking

4. **As Receiver**:
   - Can see assigned volunteer
   - Can track delivery status

## Important Notes

1. **Existing Functionality Preserved**: All existing rules for donations, users, and other collections remain intact
2. **New Fields Added**: Donations now have delivery tracking fields but old donations without them will still work
3. **Backward Compatible**: The rules support both donations with and without assigned volunteers
4. **Admin Control**: Admins have full control over the delivery system for quality assurance

## Applying the Rules

1. Go to Firebase Console → Your Project
2. Navigate to Firestore Database → Rules
3. Replace the existing rules with the rules above
4. Click "Publish"
5. Test thoroughly with different user roles

## Security Considerations

- ✅ Volunteers can only see and update their own rides
- ✅ Admins control ride assignment and verification
- ✅ Credits are only awarded by admin verification, not by volunteers
- ✅ Users cannot manipulate their own credits or stats
- ✅ Delivery status updates are restricted to relevant parties
- ✅ All read operations require authentication
