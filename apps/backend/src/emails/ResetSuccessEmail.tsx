import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  pixelBasedPreset,
  Tailwind,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  name: string
}

export const ResetSuccessEmail = ({ name }: Props) => (
  <Html>
    <Head />
    <Tailwind config={{ presets: [pixelBasedPreset] }}>
      <Body className="mx-auto my-auto bg-white px-2 font-sans">
        <Preview>Your password has been reset successfully</Preview>
        <Container className="mx-auto my-[40px] max-w-[465px] p-[20px]">
          <Heading className="mx-0 my-[30px] p-0 text-center font-bold text-[24px] text-black">
            Password Reset Successful
          </Heading>
          <Text className="text-[14px] text-black leading-[24px]">
            Hello {name},
          </Text>
          <Text className="text-[14px] text-black leading-[24px]">
            Your password has been changed successfully. You can now log in
            using your new password.
          </Text>
          <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
          <Text className="text-[#999999] text-[13px] leading-[20px] mt-4">
            If you did not perform this action, please contact our support team
            immediately at{' '}
            <Link
              href="mailto:support@nrata.lol"
              className="text-blue-600 no-underline">
              support@nrata.lol
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
)

export default ResetSuccessEmail
