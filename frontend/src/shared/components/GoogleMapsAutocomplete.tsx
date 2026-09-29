interface LocationDetails {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
}

interface GoogleMapsAutocompleteProps {
    value: string;
    onChange: (value: string, details?: LocationDetails) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
}

/** Location text entry without exposing a Google API key in browser code. */
export const GoogleMapsAutocomplete = ({
    value,
    onChange,
    placeholder = 'Enter city or location',
    className = '',
    disabled = false,
    error,
    id = 'location-input',
}: GoogleMapsAutocompleteProps) => (
    <div>
        <input
            id={id}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={className}
            autoComplete="address-level2"
        />
        {error && <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
    </div>
);

export default GoogleMapsAutocomplete;
