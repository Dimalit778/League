# League App Storage Policies

This document explains the storage policies for the League app and how to test them.

## Storage Structure

Images are stored in the `images` bucket with the following path structure:

```
images/
  ├── {league_id}/
  │   ├── {user_id}/
  │   │   ├── image1.png
  │   │   ├── image2.png
  │   │   └── ...
  │   └── {another_user_id}/
  │       └── ...
  └── {another_league_id}/
      └── ...
```

## Storage Policies

The storage policies enforce the following rules:

1. **Read Access**: Users can only read images from leagues they are members of.
2. **Write Access**: Users can only upload/update/delete their own images in any league.

## Testing the Policies

### Prerequisites

1. Make sure you have the Supabase CLI installed or access to the Supabase dashboard.
2. Have at least two test users and one test league set up.

### Step 1: Run the SQL Script

Run the `storage_policies.sql` script in the Supabase SQL editor to create the bucket and set up the policies.

### Step 2: Test Read Access

1. **Positive Test**:
   - Log in as User A who is a member of League X.
   - Try to access an image in League X: `storage.from('images').download('X/any-user-id/image.png')`.
   - This should succeed if User A is a member of League X.

2. **Negative Test**:
   - Log in as User B who is NOT a member of League Y.
   - Try to access an image in League Y: `storage.from('images').download('Y/any-user-id/image.png')`.
   - This should fail with a permission error.

### Step 3: Test Write Access

1. **Positive Test**:
   - Log in as User A.
   - Try to upload an image with User A's ID in the path: `storage.from('images').upload('any-league-id/A/image.png', file)`.
   - This should succeed because User A is uploading their own image.

2. **Negative Test**:
   - Log in as User A.
   - Try to upload an image with User B's ID in the path: `storage.from('images').upload('any-league-id/B/image.png', file)`.
   - This should fail with a permission error.

### Step 4: Test Update/Delete Access

1. **Positive Test**:
   - Log in as User A.
   - Try to update or delete an image with User A's ID in the path.
   - This should succeed.

2. **Negative Test**:
   - Log in as User A.
   - Try to update or delete an image with User B's ID in the path.
   - This should fail with a permission error.

## Troubleshooting

If you encounter issues with the storage policies:

1. Check that the `is_member_of_league` function is correctly defined and working.
2. Verify that the league_id and user_id in the path match the expected format.
3. Ensure the bucket name is correctly set to 'images'.
4. Check the Supabase logs for any policy evaluation errors.

## Code Example

Here's a simple code example to test the policies:

```typescript
// Test read access
const { data, error } = await supabase.storage
  .from('images')
  .download(`${leagueId}/${userId}/image.png`);

if (error) {
  console.error('Read access denied:', error);
} else {
  console.log('Read access granted');
}

// Test write access
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('images')
  .upload(`${leagueId}/${userId}/test-image.png`, file);

if (uploadError) {
  console.error('Write access denied:', uploadError);
} else {
  console.log('Write access granted');
}
```
