'use client';
import { Button } from '@/registry/new-york-v4/ui/button';

import { toast } from 'sonner';

/**
 * The main page component that renders the HomePage component.
 *
 * @returns {JSX.Element} The rendered HomePage component.
 */
const Page = () => {
	return <Button onClick={() => toast.success('This is a test toast from the Page component!')}>Test Btn</Button>;
};

export default Page;
