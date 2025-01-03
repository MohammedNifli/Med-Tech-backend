export function mapExperienceToRange(experience) {
    switch (experience) {
        case "below 5 years":
            return 0; // Use a low threshold if applicable
        case "5-10 years":
            return 5; // Set lower bound for experience
        case "above 10 years":
            return 10; // Set minimum for this range
        default:
            return undefined; // If no matching experience, return undefined
    }
}
export function mapConsultationFeeToRange(fee) {
    switch (fee) {
        case "Free":
            return 0;
        case "₹100-₹300":
            return { $gte: 100, $lte: 300 };
        case "₹301-₹500":
            return { $gte: 301, $lte: 500 };
        case "₹501-₹1000":
            return { $gte: 501, $lte: 1000 };
        case "Above ₹1000":
            return { $gt: 1000 };
        default:
            return undefined; // If no matching fee range, return undefined
    }
}
