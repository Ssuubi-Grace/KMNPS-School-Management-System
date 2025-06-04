
import Image from 'next/image'
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center">
      <Image
        src="/kutya_Mukama_Logo.png"
        alt="School Logo"
        width={100}
        height={100}
        className="mx-auto"
      />
      <h1 className="text-3xl font-bold mt-4 text-blue-800">
        Welcome to Our School Management System
      </h1>
      <p className="mt-2 text-gray-600">
        Manage students, payments, and requirements with ease.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
        <div className="bg-blue-500 p-6 rounded-xl shadow">

          <Link href="/classes/nursery" >
            👶 Nursery Section
          </Link>
        </div>
        <div className="bg-green-500 p-6 rounded-xl shadow">
          <Link href="/classes/primary" >
            📚 Primary Section
          </Link>
        </div>
        <div className="bg-yellow-500 p-6 rounded-xl shadow">
          <Link href="/payments" >
            💸 Payments
          </Link>
        </div>
      </div>
    </div>
  )
}


