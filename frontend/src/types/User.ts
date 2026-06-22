export interface User {
  id: string;
  email: string;
  name: string;
  isCruxMember?: boolean;
  pfpUrl: string;
  cfHandle: string | null;
  cfRating: number | null;
  createdAt: string;
  codechefHandle: string | null;
  atcoderHandle: string | null;
  leetcodeHandle: string | null;
}
