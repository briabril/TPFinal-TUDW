"use client"
import { useState } from "react"
import Button from "./Button"

type Field = {
    name: string;
    label : string;
    type? : string;
}

type AuthFormProps = {
    title: string;
    fields: Field[];
    type?: string;
    onSubmit: (data: Record<string, string>) => Promise<void>;
}
const AuthForm: React.FC<AuthFormProps> = ({title, fields, onSubmit}) => { 

    const [formData, setFormData] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e:React.FormEvent) =>{
        e.preventDefault();
        setLoading(true);
        try{
            await onSubmit(formData)
        }finally{
            setLoading(false);
        }
    }
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
        ))}

        <Button type="submit" disabled={loading}>
          {loading ? "Procesando..." : title}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
