/**
 * Upwork API Response Types
 * Based on Upwork GraphQL API documentation
 */

// ============================================================================
// Profile Types
// ============================================================================

export interface TalentProfile {
  personId: string;
  identity?: TalentProfileIdentity;
  personalData?: TalentProfilePersonalData;
  preferences?: TalentProfileUserPreferences;
  settings?: TalentProfileSettings;
  personAvailability?: TalentPersonAvailability;
  projectList?: TalentProjectList;
  profileCompleteness?: TalentProfileCompletenessSummary;
  otherExperiences?: OtherExperience[];
  educationRecords?: EducationRecord[];
  employmentRecords?: EmploymentRecord[];
  skills?: TalentProfilePersonSkill[];
  jobCategories?: TalentJobCategoryGroup[];
  profileAggregates?: TalentProfileAggregate;
}

export interface TalentProfileIdentity {
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string;
}

export interface TalentProfilePersonalData {
  headline?: string;
  overview?: string;
  hourlyRate?: number;
  currency?: string;
  country?: string;
  city?: string;
  timeZone?: string;
}

export interface TalentProfileUserPreferences {
  visibility?: string;
  profileVisibility?: string;
}

export interface TalentProfileSettings {
  profileVisibility?: string;
}

export interface TalentPersonAvailability {
  status?: string;
  hoursPerWeek?: number;
  availability?: string;
}

export interface TalentProjectList {
  edges?: ProjectEdge[];
  totalCount?: number;
}

export interface ProjectEdge {
  node?: TalentProfileProject;
}

export interface TalentProfileProject {
  id: string;
  title: string;
  description: string;
  projectUrl?: string;
  completionDateTime?: string;
  public?: boolean;
  attachments?: ProjectAttachment[];
  skills?: string[];
  creationDateTime: string;
  categoryId?: string;
  category?: string;
  subCategory?: string;
}

export interface ProjectAttachment {
  type?: string;
  url?: string;
  filename?: string;
}

export interface TalentProfileCompletenessSummary {
  profileCompletenessPct?: number;
  requiredFields?: CompletenessField[];
  recommendedFields?: CompletenessField[];
}

export interface CompletenessField {
  name?: string;
  completed?: boolean;
}

export interface OtherExperience {
  title?: string;
  company?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface EducationRecord {
  schoolName?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface EmploymentRecord {
  company?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface TalentProfilePersonSkill {
  name?: string;
  proficiency?: string;
}

export interface TalentJobCategoryGroup {
  name?: string;
  subCategories?: string[];
}

export interface TalentProfileAggregate {
  totalJobs?: number;
  totalHours?: number;
  totalEarnings?: number;
  rating?: number;
}

// ============================================================================
// Job Search Types
// ============================================================================

export interface MarketplaceJobPostingsSearchResponse {
  totalCount: number;
  edges?: JobPostingEdge[];
  pageInfo?: PageInfo;
}

export interface JobPostingEdge {
  node?: MarketplaceJobPosting;
}

export interface MarketplaceJobPosting {
  id: string;
  title: string;
  description?: string;
  jobStatus?: string;
  jobType?: string;
  workload?: string;
  duration?: string;
  entryLevel?: string;
  url?: string;
  createdDate?: string;
  lastUpdatedDate?: string;
  client?: {
    uid?: string;
    name?: string;
    country?: string;
    paymentVerificationStatus?: boolean;
    totalSpent?: number;
    totalHires?: number;
    totalReviews?: number;
    rating?: number;
    jobsPosted?: number;
    pastHires?: number[];
  };
  budget?: {
    amount?: number;
    currency?: string;
    type?: string;
    min?: number;
    max?: number;
  };
  skills?: string[];
  category?: {
    name?: string;
    subCategories?: { name?: string }[];
  };
  connects?: number;
}

export interface MarketplaceJobPostingsSearchFilter {
  keyword?: string;
  category2?: string;
  subCategory2Tier?: string;
  occupation?: string;
  language?: string;
  contractType?: string;
  workload?: string;
  duration?: string;
  entryLevel?: string;
  projectLength?: string;
  hoursPerWeek?: string;
  hourlyRangeMax?: number;
  hourlyRangeMin?: number;
  fixedPriceAmountMax?: number;
  fixedPriceAmountMin?: number;
  clientFeedbackRatingMin?: number;
  clientHiresCountMin?: number;
  clientPaymentsTotalSpentMin?: number;
  clientReviewsCountMin?: number;
  clientJobPostingCountMin?: number;
  proposalsInvited?: boolean;
  proposalsLessThan?: number;
  searchTag?: string[];
  excludeSearchTag?: string[];
}

export interface MarketplaceJobPostingSearchSortAttribute {
  sortType?: string;
  descending?: boolean;
}

export interface MarketplaceJobPostingSearchType {
  type?: string;
}

export interface PageInfo {
  hasNextPage?: boolean;
  endCursor?: string;
}

// ============================================================================
// Contract Types
// ============================================================================

export interface Contract {
  id: string;
  title?: string;
  status?: string;
  deliveryModel?: string;
  kind?: string;
  isPtc?: boolean;
  createDate?: string;
  modifyDate?: string;
  startDate?: string;
  endDate?: string;
  offer?: Offer;
  offerId?: string;
  job?: JobPosting;
  freelancer?: ContractUser;
  clientOrganization?: GenericOrganization;
  hourlyLimits?: HourlyLimit[];
  terms?: ContractTerms;
  metadata?: ContractMetadata;
}

export interface Offer {
  id: string;
  cid?: string;
  title?: string;
  jobPostingId?: string;
}

export interface JobPosting {
  id: string;
  title?: string;
  jobType?: string;
}

export interface ContractUser {
  uid?: string;
  name?: string;
  email?: string;
}

export interface GenericOrganization {
  id?: string;
  name?: string;
}

export interface HourlyLimit {
  limit?: number;
  period?: string;
  active?: boolean;
  notifyOnLimit?: boolean;
}

export interface ContractTerms {
  contractType?: string;
  weeklyLimit?: number;
  hourlyRate?: number;
  currency?: string;
  fixedPriceAmount?: number;
  milestoneDescription?: string;
}

export interface ContractMetadata {
  totalCharge?: number;
  totalHours?: number;
}

export interface TimeReport {
  dateWorkedOn?: string;
  weekWorkedOn?: string;
  monthWorkedOn?: string;
  yearWorkedOn?: string;
  freelancer?: ContractUser;
  team?: GenericOrganization;
  contract?: Contract;
  termId?: string;
  task?: string;
  taskDescription?: string;
  memo?: string;
  totalHoursWorked?: number;
  totalCharges?: number;
  totalOnlineHoursWorked?: number;
  totalOnlineCharge?: number;
  totalOfflineHoursWorked?: number;
  totalOfflineCharge?: number;
  billRate?: BillRate;
}

export interface BillRate {
  amount?: number;
  currency?: string;
}

export interface TimeReportFilter {
  organizationId_eq?: number;
  timeReportDate_bt?: DateTimeRange;
  contractIds?: number[];
}

export interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface ContractTimeReportConnection {
  totalCount?: number;
  edges?: TimeReportEdge[];
  pageInfo?: PageInfo;
}

export interface TimeReportEdge {
  node?: TimeReport;
}

// ============================================================================
// Proposal Types
// ============================================================================

export interface ClientProposal {
  id: string;
  user?: GenericUser;
  organization?: GenericOrganization;
  job?: MarketplaceJobPosting;
  terms?: ProposalTerms;
  coverLetter?: string;
  projectPlan?: ProposalProjectPlan;
  auditDetails?: ProposalAuditDetails;
  status?: ClientProposalStatus;
  annotations?: string[];
}

// Extended proposal types for new tools
export type ProposalStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'WITHDRAWN'
  | 'ARCHIVED'
  | 'INTERVIEW';
export type ProposalBidType = 'HOURLY' | 'FIXED';

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDescription?: string;
  coverLetter: string;
  bidAmount: number;
  currency: string;
  bidType: ProposalBidType;
  estimatedDuration?: string;
  status: ProposalStatus;
  submittedDate: string;
  updatedDate?: string;
  questions?: ProposalQuestion[];
  attachments?: string[];
  client?: {
    uid: string;
    name: string;
    country?: string;
  };
  interviewRoom?: {
    id: string;
    status: string;
  };
}

export interface ProposalQuestion {
  question: string;
  answer: string;
}

export interface ProposalListResponse {
  totalCount: number;
  edges: ProposalEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

export interface ProposalEdge {
  node: Proposal;
}

export interface ProposalStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  withdrawn: number;
  archived: number;
  interviewRate?: number;
  hireRate?: number;
  avgBidAmount?: number;
}

// Input types for mutations
export interface SubmitProposalInput {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
  bidType: ProposalBidType;
  estimatedDuration?: string;
  answers?: ProposalQuestion[];
  attachments?: string[];
}

export interface UpdateProposalInput {
  coverLetter?: string;
  bidAmount?: number;
  estimatedDuration?: string;
}

export interface SubmitProposalResponse {
  proposal: {
    id: string;
    status: string;
    job?: {
      id: string;
      title: string;
    };
  };
  connectsUsed: number;
  remainingConnects: number;
}

export interface UpdateProposalResponse {
  proposal: {
    id: string;
    status: string;
    bidAmount: number;
    coverLetter?: string;
    estimatedDuration?: string;
    updatedAt?: string;
  };
}

export interface WithdrawProposalResponse {
  success: boolean;
  connectsRefunded: number;
  proposal: {
    id: string;
    status: string;
  };
}

export interface GenericUser {
  uid?: string;
  displayName?: string;
  email?: string;
}

export interface ProposalTerms {
  contractType?: string;
  weeklyLimit?: number;
  hourlyRate?: number;
  fixedPriceAmount?: number;
  currency?: string;
}

export interface ProposalProjectPlan {
  description?: string;
}

export interface ProposalAuditDetails {
  createdDate?: string;
  modifiedDate?: string;
  submittedDate?: string;
}

export interface ClientProposalStatus {
  status?: string;
}

export interface ClientProposalConnection {
  totalCount?: number;
  edges?: ClientProposalEdge[];
  pageInfo?: PageInfo;
}

export interface ClientProposalEdge {
  node?: ClientProposal;
}

// ============================================================================
// Common Types
// ============================================================================

export interface Pagination {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}
