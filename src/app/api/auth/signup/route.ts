import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 },
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      options: {
        data: {
          full_name: body.name.trim(),
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        user: data.user
          ? { id: data.user.id, email: data.user.email }
          : null,
        hasSession: Boolean(data.session),
        requiresEmailConfirmation: Boolean(data.user && !data.session),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar sua conta." },
      { status: 500 },
    );
  }
}
