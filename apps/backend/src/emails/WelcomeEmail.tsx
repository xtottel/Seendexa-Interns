import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  name?: string;
  url: string;
}

export const WelcomeEmail = ({ name, url }: Props) => {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>Welcome to nrataKit</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center font-bold text-[24px] text-black">
              Welcome to nrataKit
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              We're thrilled to have you join us, {name}!
            </Text>

            <Text className="text-[14px] text-black leading-[24px]">
              Thanks your email is verified. You can now log in to your account.
              We are excited to have you on board.
            </Text>

            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                aria-label="Log in"
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={url}
                rel="noopener noreferrer"
              >
                Log in
              </Button>
            </Section>
            <Text className="break-words text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={url} className="text-blue-600 no-underline">
                {url}
              </Link>
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#999999] text-[13px] leading-[20px] mt-4">
              For your security, never share this link with anyone. If you did
              not create an account, please ignore this email or{" "}
              <Link
                href="mailto:support@nrata.lol"
                className="text-blue-600 no-underline"
              >
                contact our support team
              </Link>
              .
            </Text>

            <Text className="text-[#999999] text-[12px] leading-[20px] mt-6 text-center">
              © {new Date().getFullYear()} nrataKit. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
