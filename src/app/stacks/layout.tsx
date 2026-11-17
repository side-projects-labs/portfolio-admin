import Container from '@/components/container';
import { TopNav } from '@/components/nav';

export default function StacksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav title="스택 관리" />
      <main id="main-content" tabIndex={-1} className="admin-content py-6 tablet:py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
}
