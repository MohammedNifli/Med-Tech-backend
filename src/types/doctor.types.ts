export interface IDoctor{
    personalInfo: {
        name: string;
        gender: 'Male' | 'Female' | 'Other';
        profilePicture?: string;
        dateOfBirth?: Date;
        email: string;
        password: string;
        phone: string;
        address: {
          street?: string;
          city?: string;
          state?: string;
          country?: string;
          postalCode?: string;
        };
      };
      professionalInfo: {
        specialization: string;
        qualifications: {
          degree: string;
          institution: string;
          year: number;
        }[];
        experience?: number;
        licenseNumber: string;
        licenseFile: {
          title: string;
          file: string;
        }[];
        certificates: {
          title: string;
          file: string;
        }[];
        languages: string[];
      };
      practiceInfo: {
        clinics: {
          name: string;
          address: string;
          contactNumber: string;
        }[];
        consultationModes: {
          online: boolean;
          offline: boolean;
        };
      };
      financialInfo: {
        consultationFees: {
          online?: number;
          offline?: number;
        };
      };
      accountStatus: {
        isActive: boolean;
        verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Not Applied';
      };
      authentication: {
        password: string;
      };
      isBlocked: boolean;
      createdAt: Date;
      updatedAt: Date;
 }
