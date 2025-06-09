/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 *
 * Unit Detection Service
 * 
 * Determines whether to display speeds in mph or km/h based on user location
 */

export interface UnitPreference {
  speed: 'mph' | 'kmh';
  distance: 'miles' | 'km';
  country: string | null;
  confidence: 'high' | 'medium' | 'low';
  method: 'ipinfo' | 'locale' | 'timezone' | 'default';
}

// Countries that use mph for road speeds
const MPH_COUNTRIES = new Set(['US', 'GB']); // USA, Great Britain

export class UnitDetectionService {
  private cachedPreference: UnitPreference | null = null;

  /**
   * Detect appropriate speed units for the user's location
   */
  async detectUnits(): Promise<UnitPreference> {
    if (this.cachedPreference) {
      return this.cachedPreference;
    }

    // Try multiple detection methods in order of reliability
    const methods = [
      () => this.detectFromIPInfo(),
      () => this.detectFromLocale(),
      () => this.detectFromTimezone(),
      () => this.getDefaultPreference()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result) {
          this.cachedPreference = result;
          return result;
        }
      } catch (error) {
        console.warn('Unit detection method failed:', error);
        continue;
      }
    }

    // Fallback to default
    const defaultPref = this.getDefaultPreference();
    this.cachedPreference = defaultPref;
    return defaultPref;
  }

  /**
   * Detect units using ipinfo.io service (most accurate)
   */
  private async detectFromIPInfo(): Promise<UnitPreference | null> {
    try {
      const response = await fetch('https://ipinfo.io/country');
      
      if (!response.ok) {
        throw new Error('IPInfo request failed');
      }
      
      const countryCode = (await response.text()).trim().toUpperCase();
      
      const speedUnit = this.getSpeedUnitForCountry(countryCode);
      return {
        speed: speedUnit,
        distance: speedUnit === 'mph' ? 'miles' : 'km',
        country: countryCode,
        confidence: 'high',
        method: 'ipinfo'
      };
    } catch (error) {
      console.warn('IPInfo detection failed:', error);
      return null;
    }
  }

  /**
   * Detect units from browser locale
   */
  private detectFromLocale(): UnitPreference | null {
    const locale = navigator.language || navigator.languages?.[0];
    if (!locale) return null;

    const parts = locale.split('-');
    const region = parts[1]?.toUpperCase();
    
    if (!region) return null;

    const speedUnit = this.getSpeedUnitForCountry(region);
    return {
      speed: speedUnit,
      distance: speedUnit === 'mph' ? 'miles' : 'km',
      country: region,
      confidence: 'medium',
      method: 'locale'
    };
  }

  /**
   * Detect units from timezone (fallback)
   */
  private detectFromTimezone(): UnitPreference | null {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const country = this.getCountryFromTimezone(timezone);
      
      if (!country) return null;

      const speedUnit = this.getSpeedUnitForCountry(country);
      return {
        speed: speedUnit,
        distance: speedUnit === 'mph' ? 'miles' : 'km',
        country,
        confidence: 'low',
        method: 'timezone'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get speed unit for a country code
   */
  private getSpeedUnitForCountry(countryCode: string): 'mph' | 'kmh' {
    const code = countryCode.toUpperCase();
    
    if (MPH_COUNTRIES.has(code)) {
      return 'mph';
    }
    
    // Default to km/h (used by most of the world)
    return 'kmh';
  }


  /**
   * Estimate country from timezone
   */
  private getCountryFromTimezone(timezone: string): string | null {
    // Simple timezone to country mapping
    const timezoneMap: Record<string, string> = {
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Phoenix': 'US',
      'America/Anchorage': 'US',
      'Pacific/Honolulu': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Dublin': 'IE',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU'
    };
    
    return timezoneMap[timezone] || null;
  }

  /**
   * Default preference (km/h since most of world uses it)
   */
  private getDefaultPreference(): UnitPreference {
    return {
      speed: 'kmh',
      distance: 'km',
      country: null,
      confidence: 'low',
      method: 'default'
    };
  }

  /**
   * Clear cached preference (for testing or manual override)
   */
  clearCache(): void {
    this.cachedPreference = null;
  }

  /**
   * Manually override unit preference
   */
  setPreference(preference: UnitPreference): void {
    this.cachedPreference = preference;
  }
}

// Export singleton instance
export const unitDetection = new UnitDetectionService();