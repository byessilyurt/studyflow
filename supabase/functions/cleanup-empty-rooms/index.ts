import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const { data: rooms, error: roomsError } = await supabase
      .from('study_rooms')
      .select('id, created_at')
      .lt('created_at', twoMinutesAgo);

    if (roomsError) throw roomsError;

    const emptyRooms = [];
    for (const room of rooms || []) {
      const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', room.id);

      if (participantsError) throw participantsError;

      if (!participants || participants.length === 0) {
        emptyRooms.push(room.id);

        await supabase.from('chat_messages').delete().eq('room_id', room.id);
        await supabase.from('study_sessions').delete().eq('room_id', room.id);
        await supabase.from('room_stats').delete().eq('room_id', room.id);
        await supabase.from('study_rooms').delete().eq('id', room.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedRooms: emptyRooms.length,
        roomIds: emptyRooms,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
