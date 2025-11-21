import { BookOpen, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-secondary text-secondary-foreground border-t border-border">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                            <BookOpen className="h-6 w-6" />
                            <span>Vats Library</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your peaceful haven for focused study and learning. Open 24/7 for dedicated students.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                            <li><a href="/dashboard" className="hover:text-foreground transition-colors">My Dashboard</a></li>
                            <li><a href="/#pricing" className="hover:text-foreground transition-colors">Membership</a></li>
                            <li><a href="/#rules" className="hover:text-foreground transition-colors">Library Rules</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>123 Student Lane, Study City</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>contact@vatslibrary.com</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Opening Hours</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex justify-between">
                                <span>Monday - Sunday</span>
                                <span>24 Hours</span>
                            </li>
                            <li className="pt-2 text-xs">
                                *Cleaning break: 6 AM - 7 AM
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Vats Library. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
