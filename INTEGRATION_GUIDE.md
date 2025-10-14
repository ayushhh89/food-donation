# Integration Guide - Delivery Tracking in Donor/Receiver Dashboards

## Quick Start

### 1. Add DeliveryTrackingCard to Donation Details Page

If you have a donation details page, add this component to show delivery tracking:

```javascript
// Example: src/pages/DonationDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DeliveryTrackingCard from '../components/delivery/DeliveryTrackingCard';

const DonationDetails = () => {
  const { donationId } = useParams();
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      const donationDoc = await getDoc(doc(db, 'donations', donationId));
      if (donationDoc.exists()) {
        setDonation({ id: donationDoc.id, ...donationDoc.data() });
      }
    };
    fetchDonation();
  }, [donationId]);

  return (
    <Container>
      {/* Your existing donation details */}

      {/* Add Delivery Tracking Card */}
      {donation?.assignedVolunteerId && (
        <Box sx={{ mt: 4 }}>
          <DeliveryTrackingCard donationId={donation.id} />
        </Box>
      )}
    </Container>
  );
};
```

### 2. Add to Donor Dashboard (List View)

Show compact delivery status in donation list:

```javascript
// Example: src/pages/DonorDashboard.js
import DeliveryTrackingCard from '../components/delivery/DeliveryTrackingCard';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);

  return (
    <Container>
      <Grid container spacing={3}>
        {donations.map((donation) => (
          <Grid item xs={12} key={donation.id}>
            <Card>
              {/* Your existing donation card content */}

              {/* Add compact delivery tracking */}
              {donation.assignedVolunteerId && (
                <CardContent>
                  <DeliveryTrackingCard
                    donationId={donation.id}
                    compact={true}
                  />
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
```

### 3. Add to Receiver Dashboard

Similar to donor, but for claimed donations:

```javascript
// Example: src/pages/ReceiverDashboard.js
import DeliveryTrackingCard from '../components/delivery/DeliveryTrackingCard';

const ReceiverDashboard = () => {
  const [claimedDonations, setClaimedDonations] = useState([]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Claimed Donations
      </Typography>

      <Grid container spacing={3}>
        {claimedDonations.map((donation) => (
          <Grid item xs={12} md={6} key={donation.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{donation.title}</Typography>
                <Typography variant="body2">{donation.quantity}</Typography>

                {/* Show delivery tracking if volunteer assigned */}
                {donation.assignedVolunteerId ? (
                  <Box sx={{ mt: 2 }}>
                    <DeliveryTrackingCard
                      donationId={donation.id}
                      compact={true}
                    />
                  </Box>
                ) : (
                  <Chip
                    label="Waiting for volunteer assignment"
                    color="warning"
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
```

---

## Component Props

### DeliveryTrackingCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `donationId` | string | required | The ID of the donation to track |
| `compact` | boolean | false | Show compact version (good for lists) |

---

## Styling Customization

### Custom Styling Example

```javascript
<DeliveryTrackingCard
  donationId={donation.id}
  sx={{
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    borderRadius: 6
  }}
/>
```

---

## Real-time Updates

The `DeliveryTrackingCard` automatically subscribes to real-time updates from Firestore. When the volunteer:
- ✅ Starts the delivery → Status updates to "In Transit"
- ✅ Completes the delivery → Status updates to "Awaiting Verification"
- ✅ Admin verifies → Status updates to "Delivered"

No manual refresh needed!

---

## Conditional Rendering Examples

### Only show if volunteer is assigned:

```javascript
{donation.assignedVolunteerId && (
  <DeliveryTrackingCard donationId={donation.id} />
)}
```

### Show different messages based on status:

```javascript
{donation.assignedVolunteerId ? (
  <DeliveryTrackingCard donationId={donation.id} />
) : donation.status === 'claimed' ? (
  <Alert severity="info">
    Waiting for admin to assign a volunteer
  </Alert>
) : (
  <Alert severity="warning">
    Donation not yet claimed
  </Alert>
)}
```

---

## Complete Example: Enhanced Donation Card

```javascript
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Button
} from '@mui/material';
import { Restaurant, Schedule, Person } from '@mui/icons-material';
import DeliveryTrackingCard from '../components/delivery/DeliveryTrackingCard';

const EnhancedDonationCard = ({ donation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'claimed': return 'warning';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ borderRadius: 4, mb: 3 }}>
      <CardContent>
        {/* Donation Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Restaurant sx={{ fontSize: 40, color: '#FF9800' }} />
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              {donation.title}
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                label={donation.status}
                size="small"
                color={getStatusColor(donation.status)}
              />
              <Chip
                label={donation.quantity}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>

        {/* Donation Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <Schedule sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
            Expires: {new Date(donation.expiryDate?.toDate()).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Person sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
            Serves: {donation.estimatedServings} people
          </Typography>
        </Box>

        {/* Delivery Tracking */}
        {donation.assignedVolunteerId && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E0E0E0' }}>
            <DeliveryTrackingCard
              donationId={donation.id}
              compact={false}
            />
          </Box>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {/* View details */}}
          >
            View Details
          </Button>
          {donation.status === 'available' && (
            <Button
              variant="contained"
              size="small"
              onClick={() => {/* Claim donation */}}
            >
              Claim
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EnhancedDonationCard;
```

---

## Testing the Integration

### Test Checklist:

1. **As Donor:**
   - [ ] Create a donation
   - [ ] Wait for receiver to claim
   - [ ] Ask admin to assign volunteer
   - [ ] Check if DeliveryTrackingCard appears
   - [ ] Watch status update in real-time as volunteer progresses

2. **As Receiver:**
   - [ ] Claim a donation
   - [ ] Wait for volunteer assignment
   - [ ] See delivery tracking card appear
   - [ ] View volunteer details
   - [ ] Track delivery progress

3. **Visual Tests:**
   - [ ] Compact version looks good in lists
   - [ ] Full version looks good on details page
   - [ ] Responsive on mobile devices
   - [ ] Progress bar animates smoothly
   - [ ] Status colors are correct

---

## Common Issues & Solutions

### Issue: Card not showing
**Solution:** Check if donation has `assignedVolunteerId` field

```javascript
// Debug: Log donation data
console.log('Donation:', donation);
console.log('Has volunteer?', !!donation.assignedVolunteerId);
```

### Issue: Data not updating
**Solution:** Ensure Firestore listener is working

```javascript
// The component uses onSnapshot for real-time updates
// Check browser console for any Firebase errors
```

### Issue: Volunteer info not displaying
**Solution:** Check if volunteer exists in users collection

```javascript
// In deliveryService.js, this fetches volunteer data:
const volunteerDoc = await getDoc(doc(db, 'users', rideData.volunteerId));
```

---

## Performance Tips

1. **Use compact mode for lists:**
   ```javascript
   // Good for performance in long lists
   <DeliveryTrackingCard donationId={id} compact={true} />
   ```

2. **Conditional rendering:**
   ```javascript
   // Only render when needed
   {donation.assignedVolunteerId && <DeliveryTrackingCard ... />}
   ```

3. **Lazy loading:**
   ```javascript
   // For large lists, use React.lazy
   const DeliveryTrackingCard = React.lazy(() =>
     import('../components/delivery/DeliveryTrackingCard')
   );
   ```

---

## Next Steps

1. ✅ Apply Firebase rules from `FIREBASE_RULES.md`
2. ✅ Import and add DeliveryTrackingCard to your dashboards
3. ✅ Test with real data flow
4. ✅ Customize styling to match your theme
5. ✅ Deploy and enjoy!

---

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for complete documentation
2. Review `FIREBASE_RULES.md` for security rules
3. Check browser console for errors
4. Verify Firebase collections have correct data structure

---

**Happy Coding! 🚀**
