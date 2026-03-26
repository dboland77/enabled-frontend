import ApproverRequestsView from '@/sections/approver/view/approver-requests-view';

export const metadata = {
  title: 'Approvals Dashboard',
  description: 'Review and manage adjustment requests assigned to you',
};

export default function ApprovalsPage() {
  return <ApproverRequestsView />;
}
