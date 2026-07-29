import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

async function run() {
  const { data, error } = await resend.emails.send({
    from: "Random Frames OS <noreply@randomframes.com>",
    to: "frames.random.7@gmail.com",
    subject: "Test",
    html: "<p>Test</p>",
  });
  console.log("Response with .com:", { data, error });

  const { data: data2, error: error2 } = await resend.emails.send({
    from: "Random Frames OS <noreply@randomframesbysavan.in>",
    to: "frames.random.7@gmail.com",
    subject: "Test",
    html: "<p>Test</p>",
  });
  console.log("Response with .in:", { data: data2, error: error2 });
  
  const { data: data3, error: error3 } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "frames.random.7@gmail.com", // owner email
    subject: "Test",
    html: "<p>Test</p>",
  });
  console.log("Response with onboarding:", { data: data3, error: error3 });
}
run();
