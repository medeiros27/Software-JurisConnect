import React from 'react';

const DesignSystem = () => {
    return (
        <div className="layout-shell">
            <aside className="sidebar p-6">
                <h2 className="text-xl font-bold mb-6 font-display">JurisConnect</h2>
                <nav className="flex flex-col gap-2">
                    <a href="#" className="text-gray-300 hover:text-white py-2">Dashboard</a>
                    <a href="#" className="text-white font-medium py-2">Design System</a>
                    <a href="#" className="text-gray-300 hover:text-white py-2">Clientes</a>
                </nav>
            </aside>

            <main className="main-content bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <header className="header bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Design System Reference</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Admin User</span>
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">A</div>
                    </div>
                </header>

                <div className="content-wrapper animate-fade-in">

                    <section className="mb-12">
                        <h2 className="mb-6 text-gray-900 dark:text-white">Colors & Typography</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 rounded-lg bg-primary-500 text-white">Primary 500</div>
                            <div className="p-4 rounded-lg bg-primary-600 text-white">Primary 600</div>
                            <div className="p-4 rounded-lg bg-gray-900 text-white">Gray 900</div>
                            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Surface</div>
                        </div>

                        <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <h1 className="text-gray-900 dark:text-white">Heading 1 (Display)</h1>
                            <h2 className="text-gray-900 dark:text-white">Heading 2 (Display)</h2>
                            <h3 className="text-gray-900 dark:text-white">Heading 3 (Display)</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Body text in Inter. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="mb-6 text-gray-900 dark:text-white">Buttons</h2>
                        <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
                            <button className="btn btn-primary">Primary Button</button>
                            <button className="btn btn-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">Secondary Button</button>
                            <button className="btn btn-ghost dark:text-gray-400 dark:hover:text-white">Ghost Button</button>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="mb-6 text-gray-900 dark:text-white">Form Elements</h2>
                        <div className="card max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="input-group">
                                <label className="label text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" className="input bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="John Doe" />
                            </div>
                            <div className="input-group">
                                <label className="label text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" className="input bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="john@example.com" />
                            </div>
                            <div className="input-group">
                                <label className="label text-gray-700 dark:text-gray-300">Status</label>
                                <select className="input bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="mb-6 text-gray-900 dark:text-white">Data Tables</h2>
                        <div className="table-container bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600">Name</th>
                                        <th className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600">Role</th>
                                        <th className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600">Status</th>
                                        <th className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Alice Johnson</td>
                                        <td className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Admin</td>
                                        <td className="border-gray-200 dark:border-gray-700"><span className="badge badge-success">Active</span></td>
                                        <td className="border-gray-200 dark:border-gray-700"><button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Edit</button></td>
                                    </tr>
                                    <tr>
                                        <td className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Bob Smith</td>
                                        <td className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Editor</td>
                                        <td className="border-gray-200 dark:border-gray-700"><span className="badge badge-warning">Pending</span></td>
                                        <td className="border-gray-200 dark:border-gray-700"><button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Edit</button></td>
                                    </tr>
                                    <tr>
                                        <td className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Charlie Brown</td>
                                        <td className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300">Viewer</td>
                                        <td className="border-gray-200 dark:border-gray-700"><span className="badge badge-neutral">Inactive</span></td>
                                        <td className="border-gray-200 dark:border-gray-700"><button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Edit</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default DesignSystem;
