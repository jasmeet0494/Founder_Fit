interface AuthHeaderProps {
    subtitle?: string;
}

export default function AuthHeader({ subtitle = "Welcome Back" }: AuthHeaderProps) {
    return (
        <div className="text-center">
            <h1 className="font-orb">
                <span className="text-white">Founder</span>
                <span className="text-[#00BCD4]">Fit</span>
            </h1>
            <p className="text-muted-text tracking-widest mt-2 font-mono2">{subtitle}</p>
        </div>
    );
}