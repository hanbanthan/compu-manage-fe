'use client'

import Spinner from "@/app/_components/spinner";
import { useAuth } from "@/app/_context/auth-context";
import useUserService from "@/app/_services/useUserService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Users() {
    const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
    const userService = useUserService();
    const router = useRouter();
    const { isAuthenticated, user: authUser, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) return;
        if (authUser?.role !== 'admin' && authUser?.role !== 'superadmin') {
            router.replace('/');
        }
    }, [isAuthenticated, authUser, router, loading]);

    useEffect(() => {
        userService.getAllUsers();
    }, []);

    if (!isAuthenticated || !authUser) return <Spinner />;

    const users = userService.users;
    const currentUser = userService.currentUser;



    function TableBody() {
        if (!users) {
            return (
                <tr>
                    <td colSpan={7}>
                        <Spinner />
                    </td>
                </tr>
            );
        }

        if (users.length === 0) {
            return (
                <tr>
                    <td colSpan={8} className="text-center">
                        <div className="p-2">No Users To Display</div>
                    </td>
                </tr>
            );
        }

        return (
            <>
                {users.map((user) => (
                    <tr key={user.user_id}>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>

                            {(user.role === 'user' || user.role === 'admin') &&
                                currentUser?.role === 'superadmin' && (
                                    <div className="d-inline-block position-relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdownUserId(prev => (prev === user.user_id ? null : (user.user_id ?? null)));
                                            }}
                                            className="btn btn-sm btn-primary me-1"
                                            style={{ width: '100px' }}
                                        >
                                            Change role
                                        </button>

                                        {activeDropdownUserId === user.user_id && (
                                            <div
                                                className="dropdown-menu show position-absolute mt-1"
                                            >
                                                <button
                                                    onClick={() => {
                                                        if (user.user_id) {
                                                            userService.changeRole(user.user_id, 'admin');
                                                            setActiveDropdownUserId(null);
                                                        }
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (user.user_id) {
                                                            userService.changeRole(user.user_id, 'user');
                                                            setActiveDropdownUserId(null);
                                                        }
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    User
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {(user.role === 'user' ||
                                (user.role === 'admin' && currentUser?.role === 'superadmin')) && (
                                    <button
                                        onClick={() => user.user_id && userService.deleteUser(user.user_id)}
                                        className="btn btn-sm btn-danger btn-delete-user"
                                        style={{ width: '100px' }}
                                    >
                                        Delete
                                    </button>
                                )}
                        </td>
                    </tr>
                ))}
            </>
        );
    }


    return (
        <>
            <h1 className="mb-3">Users</h1>

            <div className="d-flex justify-content-between align-items-center mb-3">
                {currentUser?.role === 'superadmin' && <Link href="/users/add" className="btn btn-sm btn-success mb-2" style={{ height: '38px' }}>Add Admin</Link>}
            </div>

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th style={{ width: '30%', backgroundColor: '#808080', color: 'white' }}>Username</th>
                            <th style={{ width: '30%', backgroundColor: '#808080', color: 'white' }}>Role</th>
                            <th style={{ width: '30%', backgroundColor: '#808080', color: 'white' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableBody />
                    </tbody>
                </table>
            </div>
        </>
    );
}