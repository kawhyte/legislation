import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import usStates from '@/data/usStates';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeProfileSetup, isLoadingPreferences, userPreferences } = useUserData();
  
  const [displayName, setDisplayName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing preferences when component mounts or when userPreferences changes
  React.useEffect(() => {
    if (userPreferences) {
      console.log('Loading user preferences:', userPreferences);
      setDisplayName(userPreferences.displayName || '');
      setSelectedState(userPreferences.selectedState || '');
      console.log('Set selectedState to:', userPreferences.selectedState);
    }
  }, [userPreferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (!selectedState) {
      setError('Please select your state');
      return;
    }

    try {
      setIsSubmitting(true);
      await completeProfileSetup({
        displayName: displayName.trim(),
        selectedState
      });
      
      // Redirect to home page which will now show bills from their state
      navigate('/');
    } catch (err) {
      console.error('Profile setup error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        displayName: displayName.trim(),
        selectedState
      });
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Setup failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = displayName.trim() && selectedState;
  const isLoading = isSubmitting || isLoadingPreferences;
  const isEditing = userPreferences && userPreferences.profileSetupCompleted;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing 
              ? 'Update your preferences to customize your experience'
              : 'Help us personalize your legislation tracking experience'
            }
          </p>
        </div>

        {/* Profile Setup Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                Display Name
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                className="w-full"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                This is how other users will see your name
              </p>
            </div>

            {/* State Selection */}
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium text-foreground">
                Your State
              </label>
              <Select 
                value={selectedState} 
                onValueChange={(value) => {
                  console.log('Select changed to:', value);
                  setSelectedState(value);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {usStates.map((state) => (
                    <SelectItem 
                      key={state.abbreviation} 
                      value={state.abbreviation}
                      className="flex items-center space-x-2"
                    >
                      <span className="flex items-center space-x-2">
                        <img 
                          src={state.flagUrl} 
                          alt={`${state.name} flag`}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                        <span>{state.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                We'll show you legislation from your state first
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Setting up...'}</span>
                </div>
              ) : (
                isEditing ? 'Save Changes' : 'Complete Setup'
              )}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You can change these settings anytime in your profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;