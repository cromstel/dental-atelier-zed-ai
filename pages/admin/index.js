import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export default function AdminDashboard({ appointments: initialAppointments }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [updateState, setUpdateState] = useState({ kind: "idle", message: "" });

  async function updateAppointmentStatus(id, status) {
    setUpdateState({ kind: "pending", message: "Updating appointment status…" });

    try {
      const response = await fetch("/api/admin/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to update appointment status.");

      setAppointments((current) => current.map((appointment) => (
        appointment.id === result.id ? result : appointment
      )));
      setUpdateState({ kind: "success", message: "Appointment status updated." });
    } catch (error) {
      setUpdateState({ kind: "error", message: error.message || "Unable to update appointment status." });
    }
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Dental Atelier</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-content px-5 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">
              Administration
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-brand">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900" href="/admin/faqs">
              Manage FAQs
            </Link>
            <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900" href="/admin/testimonials">
              Manage testimonials
            </Link>
            <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900" href="/admin/gallery">
              Manage gallery
            </Link>
            <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900" href="/admin/inquiries">
              View inquiries
            </Link>
            <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900" href="/admin/settings">
              Site settings
            </Link>
            <Link className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900" href="/admin/content">
              Edit page content
            </Link>
            <button
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-brand hover:bg-gray-50"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </button>
          </div>
        </div>
        <section
          className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          aria-labelledby="appointments-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="appointments-heading"
              className="text-2xl font-semibold text-brand"
            >
              Recent appointment requests
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">
              {appointments.length} shown
            </span>
          </div>
          {appointments.length === 0 ? (
            <p className="mt-6 text-gray-600">No appointment requests yet.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Requested for</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      className="border-b border-gray-100"
                      key={appointment.id}
                    >
                      <td className="py-4 pr-4 font-medium text-gray-900">
                        {appointment.firstName} {appointment.lastName}
                      </td>
                      <td className="py-4 pr-4">
                        <a
                          className="text-brand underline"
                          href={`mailto:${appointment.email}`}
                        >
                          {appointment.email}
                        </a>
                      </td>
                      <td className="py-4 pr-4">
                        {new Intl.DateTimeFormat("en-BE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Europe/Brussels",
                        }).format(new Date(appointment.dateTime))}
                      </td>
                      <td className="py-4">
                        <select
                          aria-label={`Status for ${appointment.firstName} ${appointment.lastName}`}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1.5"
                          disabled={updateState.kind === "pending"}
                          onChange={(event) => updateAppointmentStatus(appointment.id, event.target.value)}
                          value={appointment.status}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p
          aria-live="polite"
          className={`mt-4 text-sm ${updateState.kind === "error" ? "text-red-700" : updateState.kind === "success" ? "text-green-700" : "text-gray-600"}`}
        >
          {updateState.message}
        </p>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user?.role !== "ADMIN") {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return { props: { appointments: JSON.parse(JSON.stringify(appointments)) } };
}
