/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/app/forgot-password/hooks/hooks";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define a simple schema for the mobile number field
const ForgotPasswordSchema = z.object({
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^(\+?\d{1,3})?\d{10}$/, "Invalid mobile number format"),
});

const ForgotPassword = () => {
  const router = useRouter();
  const { mutate } = useForgotPassword();
  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  async function handleSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    // Handle the forgot password logic (e.g., sending an OTP)
    mutate(values.mobileNumber, {
      onSuccess: (data: any) => {
        toast.success("An otp was sent to your whatsapp");
        console.log(data);
        // Navigate to the OTP screen with the JWT token
        router.push(`/otp/${data.jwt}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    // You might call your API here...
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Section - Image */}
        <div className="relative w-full md:w-1/2 bg-[#f8f3e9] hidden md:block">
          <div className="absolute top-6 left-6 z-10">
            <Image
              src="https://res.cloudinary.com/dklqhgo8r/image/upload/v1741713365/omez9tvbpnwgmsnj3q3w.png"
              alt="RAAS The Creation Logo"
              width={120}
              height={50}
              className="h-auto"
            />
          </div>
          <div className="h-full">
            <Image
              src="/lot_0036__PUN0667.png"
              alt="Model in orange traditional outfit"
              fill
              className="object-cover "
              priority
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              {/* Logo for mobile view */}
              <div className="md:hidden">
                <Image
                  src="https://res.cloudinary.com/dklqhgo8r/image/upload/v1741713365/omez9tvbpnwgmsnj3q3w.png"
                  alt="RAAS The Creation Logo"
                  width={100}
                  height={40}
                  className="h-auto"
                />
              </div>
              <Link
                href="/"
                className="ml-auto bg-[#a08452] hover:bg-[#8c703d] text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <span>BACK</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-medium mb-2">Forgot Password?</h1>
              <p className="text-gray-500 flex items-center gap-1">
                Enter Your Mobile Number
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-xl border-2 border-[#a08452] focus:outline-[#a08452]">
                          <Input
                            placeholder="Mobile Number"
                            className="w-full p-4 sm:p-5 text-white bg-transparent border-0 rounded-xl outline-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm ml-2" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full p-3 text-white text-lg rounded-xl bg-[#a08452] shadow-[0_4px_20px_rgba(255,255,255,0.6)]"
                >
                  Send OTP
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
