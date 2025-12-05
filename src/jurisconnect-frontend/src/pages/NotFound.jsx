import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-light-100 px-4">
            <div className="text-center max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold font-primary text-primary-600 mb-4">404</h1>
                    <div className="w-32 h-1 bg-primary-500 mx-auto rounded-full"></div>
                </div>

                <h2 className="text-4xl font-bold font-primary text-dark-500 mt-8">
                    Página não encontrada
                </h2>

                <p className="text-gray-600 mt-6 text-lg max-w-md mx-auto leading-relaxed">
                    A página que você está procurando não existe ou foi movida.
                    Utilize o botão abaixo para retornar ao dashboard.
                </p>

                <div className="mt-10 flex gap-4 justify-center">
                    <Link to="/">
                        <Button variant="primary" size="lg" className="gap-2">
                            <Home className="w-5 h-5" />
                            Voltar para o Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 text-8xl opacity-20">🔍</div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        <strong className="text-primary-600 font-primary">JurisConnect</strong> - Gestão de Correspondentes Jurídicos
                    </p>
                </div>
            </div>
        </div>
    );
}
